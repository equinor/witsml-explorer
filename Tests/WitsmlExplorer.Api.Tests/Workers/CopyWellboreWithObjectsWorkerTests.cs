using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.MudLog;
using Witsml.Data.Rig;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    /// <summary>
    /// Helper class that contains information about the mock objects used in the tests.
    /// </summary>
    public record MockObjectInfo
    {
        public EntityType EntityType { get; set; }
        public string Name { get; set; }
        public string Uid { get; set; }
    }


    public class CopyWellboreWithObjectsWorkerTests
    {
        private const string SourceWellUid = "sourceWellUid";
        private const string TargetWellUid = "targetWellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";

        private CopyWellboreWithObjectsWorker _worker;
        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider = new();

        public CopyWellboreWithObjectsWorkerTests()
        {
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_targetWitsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_sourceWitsmlClient.Object);
            MockWorkers(isCopyWellboreSuccess: true, isCopyObjectsSuccess: true, isCancellationRequested: false);
        }

        [Fact]
        public async Task Execute_EmptyTargetWellboreExists_Copy()
        {
            //Arrange
            WitsmlWellbore existing = CreateWellbore(TargetWellboreUid);
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };
            WitsmlWellbores existingWells = new() { Wellbores = existing.AsItemInList() };
            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(TargetWellUid, TargetWellboreUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                               .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => existingWells);

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();
            SetupStoreAddUpdate();
            CopyWellboreWithObjectsJob job = CreateJobTemplate(null);
            job.Source.SelectedObjects =
                new List<SelectableObjectOnWellbore>();
            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            _targetWitsmlClient.Verify(c => c.AddToStoreAsync(It.IsAny<WitsmlWellbores>()), Times.Never);
        }

        [Fact]
        public async Task Execute_AllObjectsCopy_Succeeded()
        {
            //Arrange
            SetupGetTargetWellbore();
            SetupGetSourceWellbore();

            SetupStoreAddUpdate();

            var mockObjectList = MakeObjectListSetups(_sourceWitsmlClient, SourceWellboreUid);
            var selectedObjectTypesToCopy = GetSelectedObjectTypesList(mockObjectList);

            CopyWellboreWithObjectsJob job = CreateJobTemplate(selectedObjectTypesToCopy);

            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal("Successfully copied wellbore with all supported child objects.", result.Item1.Message);
            Assert.True(IsReportItemListEqualToMockObjectList(job.JobInfo.Report.ReportItems.ToList(), mockObjectList));
        }

        [Fact]
        public async Task Execute_SelectedObjectsCopy_BhaRuns_Succeeded()
        {
            //Arrange
            SetupGetTargetWellbore();
            SetupGetSourceWellbore();

            SetupStoreAddUpdate();
            var mockObjectList = MakeObjectListSetups(_sourceWitsmlClient, TargetWellboreUid);

            //Arrange selected BhaRuns type only to be copied
            var selectedObjectTypesToCopy = GetSelectedObjectTypesList(mockObjectList);
            var selectedBhaRunsToCopyOnly = selectedObjectTypesToCopy.Where(x => x.ObjectType == EntityType.BhaRun.ToString()).ToList();

            CopyWellboreWithObjectsJob job = CreateJobTemplate(selectedBhaRunsToCopyOnly);

            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal("Successfully copied wellbore with all supported child objects.", result.Item1.Message);

            var bhaRunsSelectedObjectsOnly = mockObjectList.Where(x => x.EntityType == EntityType.BhaRun).ToList();
            Assert.True(IsReportItemListEqualToMockObjectList(job.JobInfo.Report.ReportItems.ToList(), bhaRunsSelectedObjectsOnly));
        }

        [Fact]
        public async Task Execute_CancellationRequested()
        {
            //Arrange
            MockWorkers(isCopyWellboreSuccess: true, isCopyObjectsSuccess: true, isCancellationRequested: true);

            SetupGetTargetWellbore();
            SetupGetSourceWellbore();

            SetupStoreAddUpdate();

            CancellationTokenSource cancellationTokenSource = new();
            await cancellationTokenSource.CancelAsync();

            var mockObjectList = MakeObjectListSetups(_sourceWitsmlClient, SourceWellboreUid);
            var selectedObjectTypesToCopy = GetSelectedObjectTypesList(mockObjectList);

            CopyWellboreWithObjectsJob job = CreateJobTemplate(selectedObjectTypesToCopy);

            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job, cancellationTokenSource.Token);

            //Assert
            Assert.False(result.Item1.IsSuccess);
        }

        [Fact]
        public async Task Execute_AllObjectsCopy_Failed()
        {
            //Arrange
            MockWorkers(isCopyWellboreSuccess: true, isCopyObjectsSuccess: false, isCancellationRequested: false);
            SetupGetTargetWellbore();
            SetupGetSourceWellbore();

            SetupStoreAddUpdate();

            var mockObjectList = MakeObjectListSetups(_sourceWitsmlClient, SourceWellboreUid);

            var selectedObjectTypesToCopy = GetSelectedObjectTypesList(mockObjectList);
            CopyWellboreWithObjectsJob job = CreateJobTemplate(selectedObjectList: selectedObjectTypesToCopy);

            List<WitsmlWellbores> updatedWellbores = new();
            _targetWitsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));
            _targetWitsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));
            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal(result.Item1.Message, $"Partially copied wellbore with some child objects. Failed to copy {mockObjectList.Count} out of {mockObjectList.Count} objects.");
            Assert.Equal(job.JobInfo.Report.ReportItems.ToList().Count, mockObjectList.Count);
        }

        private void MockWorkers(bool isCopyWellboreSuccess, bool isCopyObjectsSuccess = true, bool isCancellationRequested = false)
        {
            Mock<ICopyWellboreWorker> copyWellboreWorker = new();
            var reason = isCopyWellboreSuccess ? null : "test wellbore copy failed";
            var copyWellboreWorkerResult = new WorkerResult(new Uri("http://localhost"), isSuccess: isCopyWellboreSuccess, null, reason);

            copyWellboreWorker.Setup(worker => worker.Execute(It.IsAny<CopyWellboreJob>(), It.IsAny<CancellationToken?>()))
                .ReturnsAsync((copyWellboreWorkerResult, null));

            var copyObjectWorkerResult = isCancellationRequested ? new WorkerResult(null, isSuccess: false, "The job was cancelled.")
                   : new WorkerResult(null, isSuccess: isCopyObjectsSuccess, null);

            Mock<ICopyObjectsWorker> copyObjectsWorker = new();
            copyObjectsWorker.Setup(worker => worker.Execute(It.IsAny<CopyObjectsJob>(), It.IsAny<CancellationToken?>()))
                                .ReturnsAsync((copyObjectWorkerResult, null));
            Mock<IObjectService> objectServiceMock = new();
            objectServiceMock.Setup(os => os.GetAllObjectsOnWellbore(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(new List<SelectableObjectOnWellbore>());

            _worker = new CopyWellboreWithObjectsWorker(NullLogger<CopyWellboreWithObjectsJob>.Instance,
                _witsmlClientProvider.Object,
                copyObjectsWorker.Object,
                copyWellboreWorker.Object,
                objectServiceMock.Object);
        }

        /// <summary>
        /// Method to create a list of mock objects for the given wellboreUid.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="wellboreUid"></param>
        /// <param name="cancellationToken"></param>
        /// <returns>List of mock objects having basic info. This is a helper collection used in assert stuff</returns>
        private static List<MockObjectInfo> MakeObjectListSetups(Mock<IWitsmlClient> client, string wellboreUid, CancellationToken? cancellationToken = null)
        {
            var resultMockObjectList = new List<MockObjectInfo>();

            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                IWitsmlObjectList objectList = entityType
                switch
                {
                    EntityType.BhaRun => GetBhaRuns(wellboreUid),
                    EntityType.FluidsReport => GetFluidsReports(wellboreUid),
                    EntityType.FormationMarker => new WitsmlFormationMarkers(),
                    EntityType.Message => new WitsmlMessages(),
                    EntityType.MudLog => new WitsmlMudLogs(),
                    EntityType.Rig => GetRigs(wellboreUid),
                    EntityType.Risk => new WitsmlRisks(),
                    EntityType.Tubular => new WitsmlTubulars(),
                    EntityType.Trajectory => new WitsmlTrajectories(),
                    EntityType.WbGeometry => new WitsmlWbGeometrys(),
                    EntityType.Attachment => new WitsmlAttachments(),
                    _ => null
                };

                if (objectList == null)
                {
                    continue;
                }

                resultMockObjectList.AddRange(objectList.Objects.Select(o => new MockObjectInfo()
                {
                    EntityType = entityType,
                    Name = o.Name,
                    Uid = o.Uid
                }).ToList());

                IWitsmlObjectList nonLogsObjectsQuery = ObjectQueries.GetWitsmlObjectById(SourceWellUid, SourceWellboreUid, "", entityType);
                client.Setup(c => c.GetFromStoreNullableAsync(IsQuery(nonLogsObjectsQuery), It.IsAny<OptionsIn>(), cancellationToken))
                                   .ReturnsAsync((IWitsmlObjectList _, OptionsIn _, CancellationToken? _) => objectList);
            }

            resultMockObjectList.AddRange(MakeLogObjectListSetups(client, wellboreUid));

            return resultMockObjectList;
        }

        /// <summary>
        /// Adding log objects to the mock client. This differs to adding objects in <see cref="MakeObjectListSetups"/>"
        /// in that it adds two log objects for each index type.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="wellboreUid"></param>
        /// <returns>List of mock objects having basic info. This is a helper collection used in assert stuff</returns>
        private static List<MockObjectInfo> MakeLogObjectListSetups(
            Mock<IWitsmlClient> client,
            string wellboreUid)
        {
            var resultMockObjectList = new List<MockObjectInfo>();
            var logIndexTypes = new[] { WitsmlLog.WITSML_INDEX_TYPE_MD, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME };

            foreach (var logIndexType in logIndexTypes)
            {
                var logMockObjects = GetMockLogObjects(wellboreUid, logIndexType);

                IWitsmlObjectList logsObjectsQuery = ObjectQueries.GetWitsmlObjectById(SourceWellUid, SourceWellboreUid, "", EntityType.Log);
                ((WitsmlLog)logsObjectsQuery.Objects.FirstOrDefault()).IndexType = logIndexType;
                client.Setup(c => c.GetFromStoreNullableAsync(IsQuery(logsObjectsQuery),
                                It.IsAny<OptionsIn>(), null))
                                .ReturnsAsync((IWitsmlObjectList _, OptionsIn _, CancellationToken? _) => logMockObjects);

                resultMockObjectList.AddRange(logMockObjects.Objects.Select(o => new MockObjectInfo()
                {
                    EntityType = EntityType.Log,
                    Name = o.Name,
                    Uid = o.Uid
                }).ToList());
            }

            return resultMockObjectList;
        }

        private void SetupGetSourceWellbore()
        {
            WitsmlWellbores sourceWellbores = new();
            sourceWellbores.Wellbores = new List<WitsmlWellbore>()
            {
                new WitsmlWellbore()
                {
                    Name = "targetWellboreName", Uid = "targetWellboreUid"
                }
            };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(SourceWellUid, SourceWellboreUid);

            _sourceWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => sourceWellbores);
        }

        private void SetupGetTargetWellbore()
        {
            WitsmlWellbores targetWellbores = new();
            targetWellbores.Wellbores = new List<WitsmlWellbore>()
            {
                new WitsmlWellbore()
                {
                    Uid = "targetWellboreUid", UidWell = "targetWellUid"
                }
            };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid("targetWellUid", "targetWellboreUid");

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => targetWellbores);
        }

        private void SetupStoreAddUpdate()
        {
            List<WitsmlWellbores> updatedWellbores = new();
            _targetWitsmlClient.Setup(client =>
                    client.UpdateInStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));
            _targetWitsmlClient.Setup(client =>
                    client.AddToStoreAsync(It.IsAny<WitsmlWellbores>())).Callback<WitsmlWellbores>(wellbores => updatedWellbores.Add(wellbores))
                .ReturnsAsync(new QueryResult(true));

        }

        private static IWitsmlObjectList GetMockLogObjects(string wellboreUid, string logIndexType)
        {
            List<WitsmlLog> logList = null;

            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD))
            {
                logList = new List<WitsmlLog>();
                for (int i = 0; i < 5; i++)
                {
                    logList.Add(new WitsmlLog
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_MD}_{i}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_MD}_{i}",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                    });
                }
            }

            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME))
            {
                logList =
                [
                    new()
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                    }
                ];
            }

            return new WitsmlLogs()
            {
                Logs = logList
            };
        }

        private static IWitsmlObjectList GetRigs(string wellboreUid)
        {
            WitsmlRigs rigs = new();
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig1",
                Name = "Rig1",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            return rigs;
        }

        private static IWitsmlObjectList GetBhaRuns(string wellboreUid)
        {
            WitsmlBhaRuns runs = new();
            for (int i = 0; i < 10; i++)
            {
                runs.BhaRuns.Add(new WitsmlBhaRun
                {
                    Uid = $"Uid_BhaRun_{i}",
                    Name = $"BhaRun_{i}",
                    UidWell = SourceWellUid,
                    NameWell = SourceWellUid,
                    UidWellbore = wellboreUid,
                    NameWellbore = wellboreUid
                });
            }
            return runs;
        }

        private static IWitsmlObjectList GetFluidsReports(string wellboreUid)
        {
            return new WitsmlFluidsReports()
            {
                FluidsReports =
                [
                    new()
                    {
                        Uid = "Uid_FluidsReport1",
                        Name = "FluidsReport1",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    },

                    new()
                    {
                        Uid = "Uid_FluidsReport2",
                        Name = "FluidsReport2",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    }

                ]
            };
        }

        private static T IsQuery<T>(T query)
            where T : IWitsmlQueryType
        {
            return It.Is<T>(q => XmlHelper.Serialize(q, false) == XmlHelper.Serialize(query, false));
        }

        private static WitsmlWellbore CreateWellbore(string uid, string name = null)
        {
            return new WitsmlWellbore { Uid = uid, Name = name ?? uid, UidWell = TargetWellUid, NameWell = "targetWellName" };
        }

        private static CopyWellboreWithObjectsJob CreateJobTemplate(List<SelectableObjectOnWellbore> selectedObjectList)
        {
            WellboreReference targetWellboreRef = new() { WellUid = "targetWellUid", WellboreUid = "targetWellboreUid" };
            WellboreReference sourceWellboreRef = new() { WellUid = "sourceWellUid", WellboreUid = "sourceWellboreUid" };

            MixedObjectsReferences sourceMixedObjectsWellboreRef = new() { WellboreReference = sourceWellboreRef, SelectedObjects = selectedObjectList };
            return new CopyWellboreWithObjectsJob
            {
                Source = sourceMixedObjectsWellboreRef,
                Target = targetWellboreRef,
                JobInfo = new JobInfo()
            };
        }

        /// <summary>
        /// Method that creates SelectableObjectOnWellbore from mock object list.
        /// This mimics list of objects selected for copy.
        /// </summary>
        /// <param name="mockObjectList"></param>
        /// <returns></returns>
        private static List<SelectableObjectOnWellbore> GetSelectedObjectTypesList(List<MockObjectInfo> mockObjectList)
        {
            return mockObjectList.Select(o => new SelectableObjectOnWellbore
            {
                ObjectType = o.EntityType.ToString(),
                Uid = o.Uid,
                Name = o.Name
            }).ToList();
        }

        /// <summary>
        /// Helper method that compares the report items with the mock object list.
        /// The items have to match in name and uid.
        /// Method is used in the asserts of the tests.
        /// </summary>
        /// <param name="reportItems"></param>
        /// <param name="mockObjectList"></param>
        /// <returns>True if both input collections contain all corresponding items</returns>
        private bool IsReportItemListEqualToMockObjectList(
            IEnumerable<object> reportItems,
            List<MockObjectInfo> mockObjectList)
        {
            HashSet<string> tmpReportObjectNamesHashSet = new();
            HashSet<string> tmpReportObjectUidsHashSet = new();
            foreach (var item in reportItems)
            {
                if (item is CopyWellboreWithObjectsReportItem witsmlObjectReference)
                {
                    tmpReportObjectNamesHashSet.Add(witsmlObjectReference.Name);
                    tmpReportObjectUidsHashSet.Add(witsmlObjectReference.Uid);
                }
            }
            var mockCopyObjectNames = mockObjectList.Select(x => x.Name).ToHashSet();
            var mockCopyObjectUids = mockObjectList.Select(x => x.Uid).ToHashSet();
            return tmpReportObjectNamesHashSet.Count == mockCopyObjectNames.Count
                   && !tmpReportObjectNamesHashSet.Except(mockCopyObjectNames).ToList().Any()
                   && !tmpReportObjectUidsHashSet.Except(mockCopyObjectUids).ToList().Any();
        }
    }
}
