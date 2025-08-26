using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging.Abstractions;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
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
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{

    public class WellboreSubObjectsComparisonWorkerTests
    {
        private const string SourceWellUid = "sourceWellUid";
        private const string TargetWellUid = "targetWellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";

        private WellboreSubObjectsComparisonWorker _worker;
        private readonly Mock<IWitsmlClient> _sourceWitsmlClient = new();
        private readonly Mock<IWitsmlClient> _targetWitsmlClient = new();
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider = new();

        private readonly Mock<ICountLogDataRowWorker> _countLogDataRowWorker;
        private readonly Mock<ICompareLogDataWorker> _compareLogDataRowWorker;

        private readonly Uri _targetUri = new("https://target");
        private readonly Uri _sourceUri = new("https://source");

        private const double DepthSourceStart = 10;
        private const double DepthSourceEnd = 15;
        private const double DepthTargetStart = 1;
        private const double DepthTargetEnd = 5;

        public WellboreSubObjectsComparisonWorkerTests()
        {
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_targetWitsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_sourceWitsmlClient.Object);
            _countLogDataRowWorker = new Mock<ICountLogDataRowWorker>();
            _compareLogDataRowWorker = new Mock<ICompareLogDataWorker>();
            MockWorkers();
        }

        [Fact]
        public async Task Execute_Compare_2_Wellbores()
        {
            //Arrange
            var witsmlLog = new WitsmlLog();
            WitsmlLogs sourceLogs = new() { Logs = witsmlLog.AsItemInList() };

            _sourceWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            _targetWitsmlClient.Setup(c =>
                    c.GetFromStoreNullableAsync(It.IsAny<IWitsmlObjectList>(),
                        It.IsAny<OptionsIn>(), null))
                .ReturnsAsync(sourceLogs);

            SetupGetSourceWellbore();
            SetupGetTargetWellbore();

            MakeObjectListSetups(_sourceWitsmlClient, SourceWellUid, SourceWellboreUid, true);
            MakeObjectListSetups(_targetWitsmlClient, TargetWellUid, TargetWellboreUid, false);

            var job = CreateJobTemplate();

            MakeLogsListSetups(_sourceWitsmlClient, job.SourceWellbore.WellUid, job.SourceWellbore.WellboreUid, true);
            MakeLogsListSetups(_targetWitsmlClient, job.TargetWellbore.WellUid, job.TargetWellbore.WellboreUid, false);



            //Act
            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            //Assert
            Assert.True(result.Item1.IsSuccess);
            var reportItems = job.JobInfo.Report.ReportItems as List<WellboreSubObjectsComparisonItem>;
            var existsOnSource = reportItems.Where(x =>
                x.ExistsOnSource.Equals("TRUE") && x.ExistsOnTarget.Equals("FALSE"));
            var existsOnTarget = reportItems.Where(x =>
                x.ExistsOnSource.Equals("FALSE") && x.ExistsOnTarget.Equals("TRUE"));
            var logsExistsOnBoth = reportItems.Where(x =>
                x.ExistsOnSource.Equals("TRUE") && x.ExistsOnTarget.Equals("TRUE"));
            var sameFluidReport =
                existsOnTarget.Where(x => x.ObjectUid.Equals("Uid_FluidsReport1"));
            var log = logsExistsOnBoth.Last();
            var differentNumberOfMnemonics =
                reportItems.Where(x => x.NumberOfMnemonicsOnSource != null);
            var countOfIssuesInMnemonics =
                reportItems.Where(x => x.NumberOfIssuesInMnemonics != null);
            var numberOfIssuesInMnemonics = countOfIssuesInMnemonics.First()
                .NumberOfIssuesInMnemonics;

            Assert.True(sameFluidReport.Count().Equals(0));
            Assert.True(existsOnSource.Count().Equals(13));
            Assert.True(existsOnTarget.Count().Equals(13));
            Assert.True(reportItems.Count().Equals(33));
            Assert.True(logsExistsOnBoth.Count().Equals(7));
            Assert.True(differentNumberOfMnemonics.Count().Equals(3));
            Assert.True(countOfIssuesInMnemonics.Count().Equals(1));
            Assert.True(numberOfIssuesInMnemonics.Equals("3"));
            Assert.Equal("10", log.SourceStart);
            Assert.Equal("15", log.SourceEnd);
            Assert.Equal("1", log.TargetStart);
            Assert.Equal("5", log.TargetEnd);

        }

        private void MockWorkers()
        {
            _countLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CountLogDataRowJob>(), null))
                .ReturnsAsync((CountLogDataRowJob job, object _) =>
                {
                    if (job.LogReference.WellboreUid == "targetWellboreUid")
                    {
                        job.JobInfo = new JobInfo
                        {
                            Report = new CountLogDataReport()
                            {
                                ReportItems = new List<CountLogDataReportItem>()
                                {
                                    new ()
                                    {
                                        Mnemonic = "a",
                                        LogDataCount = 1
                                    },
                                    new ()
                                    {
                                        Mnemonic = "b",
                                        LogDataCount = 2
                                    },
                                    new ()
                                    {
                                        Mnemonic = "c",
                                        LogDataCount = 3
                                    }
                                }
                            }
                        };
                    }
                    else
                    {
                        job.JobInfo = new JobInfo
                        {
                            Report = new CountLogDataReport()
                            {
                                ReportItems = new List<CountLogDataReportItem>()
                                {
                                    new ()
                                    {
                                        Mnemonic = "a",
                                        LogDataCount = 11
                                    },
                                    new ()
                                    {
                                        Mnemonic = "b",
                                        LogDataCount = 12
                                    },
                                    new ()
                                    {
                                        Mnemonic = "c",
                                        LogDataCount = 13
                                    }
                                }
                            }
                        };
                    }

                    return (new WorkerResult(null, true, null), null);

                });


            ;

            _compareLogDataRowWorker
                .Setup(worker => worker.Execute(It.IsAny<CompareLogDataJob>(), null))
                .ReturnsAsync((CompareLogDataJob job, object _) =>
                {
                    job.JobInfo = new JobInfo
                    {
                        Report = new BaseReport()
                        {
                            ReportItems = new List<CompareLogDataItem>()
                            {
                                new ()
                                {
                                    Mnemonic = "a",
                                    Index = "1",
                                    SourceValue = "",
                                    TargetValue = ""
                                },
                                new ()
                                {
                                    Mnemonic = "b",
                                    Index = "3",
                                    SourceValue = "",
                                    TargetValue = ""
                                },
                                new ()
                                {
                                    Mnemonic = "c",
                                    Index = "4",
                                    SourceValue = "",
                                    TargetValue = ""
                                }
                            }
                        }
                    };

                    return (new WorkerResult(null, true, null), null);
                });
            Mock<IObjectService> objectServiceMock = new();
            objectServiceMock.Setup(os => os.GetAllObjectsOnWellbore(It.IsAny<string>(), It.IsAny<string>())).ReturnsAsync(new List<SelectableObjectOnWellbore>());
            Mock<IDocumentRepository<Server, Guid>> documentRepository = new();
            documentRepository.Setup(client => client.GetDocumentsAsync())
                .ReturnsAsync(new List<Server>(){
                    new(){
                        Url = _targetUri,
                        DepthLogDecimals = 1
                    },
                    new(){
                        Url = _sourceUri,
                        DepthLogDecimals = 2
                    }
                }.AsCollection());



            _worker = new WellboreSubObjectsComparisonWorker(NullLogger<WellboreSubObjectsComparisonJob>.Instance,
                _witsmlClientProvider.Object,
                _countLogDataRowWorker.Object,
                _compareLogDataRowWorker.Object,
                documentRepository.Object);
        }

        /// <summary>
        /// Method to create a list of mock objects for the given wellboreUid.
        /// </summary>
        /// <param name="client"></param>
        /// <param name="wellUid"></param>
        /// <param name="wellboreUid"></param>
        /// <param name="isSource"></param>
        /// <param name="cancellationToken"></param>
        private static void MakeObjectListSetups(Mock<IWitsmlClient> client, string wellUid, string wellboreUid, bool isSource, CancellationToken? cancellationToken = null)
        {
            foreach (EntityType entityType in Enum.GetValues(typeof(EntityType)))
            {
                IWitsmlObjectList objectList = entityType
                switch
                {
                    EntityType.BhaRun => isSource ? GetBhaRuns(wellboreUid) : GetBhaRunsTarget(wellboreUid),
                    EntityType.FluidsReport => isSource ? GetFluidsReports(wellboreUid) : GetFluidsReportsTarget(wellboreUid),
                    EntityType.FormationMarker => new WitsmlFormationMarkers(),
                    EntityType.Message => new WitsmlMessages(),
                    EntityType.MudLog => new WitsmlMudLogs(),
                    EntityType.Rig => isSource ? GetRigs(wellboreUid) : GetRigsTarget(wellboreUid),
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

                IWitsmlObjectList nonLogsObjectsQuery = ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, "", entityType);
                client.Setup(c => c.GetFromStoreNullableAsync(IsQuery(nonLogsObjectsQuery), It.IsAny<OptionsIn>(), cancellationToken))
                                   .ReturnsAsync((IWitsmlObjectList _, OptionsIn _, CancellationToken? _) => objectList);
            }
        }

        private static void MakeLogsListSetups(
            Mock<IWitsmlClient> client, string wellUid,
            string wellboreUid, bool isSource)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogsByWellbore(wellUid, wellboreUid);

            var logMockObjects =
                GetMockLogObjects(wellboreUid, wellUid, WitsmlLog.WITSML_INDEX_TYPE_MD, isSource);
            client.Setup(c => c.GetFromStoreAsync(IsQuery(logQuery),
                    It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((IWitsmlObjectList _, OptionsIn _,
                    CancellationToken? _) => logMockObjects);
        }

        private void SetupGetSourceWellbore()
        {
            WitsmlWellbores sourceWellbores = new();
            sourceWellbores.Wellbores = new List<WitsmlWellbore>()
            {
                new WitsmlWellbore()
                {
                    Name = "sourceWellboreName", Uid = SourceWellboreUid
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
                    Uid = TargetWellboreUid, UidWell = TargetWellUid
                }
            };

            WitsmlWellbores query = WellboreQueries.GetWitsmlWellboreByUid(TargetWellUid, TargetWellboreUid);

            _targetWitsmlClient.Setup(c => c.GetFromStoreAsync(IsQuery(query), It.IsAny<OptionsIn>(), null))
                .ReturnsAsync((WitsmlWellbores _, OptionsIn _, CancellationToken? _) => targetWellbores);
        }


        private static WitsmlLogs GetMockLogObjects(string wellboreUid, string wellUid, string logIndexType, bool isSource)
        {
            List<WitsmlLog> logList = null;
            WitsmlIndex witsmlStartIndex = isSource ? new(new DepthIndex(DepthSourceStart)) : new(new DepthIndex(DepthTargetStart));
            WitsmlIndex witsmlEndIndex = isSource ? new(new DepthIndex(DepthSourceEnd)) : new(new DepthIndex(DepthTargetEnd));
            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME))
            {
                logList = new List<WitsmlLog>();
                for (int i = 0; i < 5; i++)
                {
                    logList.Add(new WitsmlLog
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}_{i}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME}_{i}",
                        UidWell = wellUid,
                        NameWell = wellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                        LogCurveInfo = LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME].Select(mnemonic => new WitsmlLogCurveInfo
                        {
                            Uid = mnemonic,
                            Mnemonic = mnemonic,
                            MinIndex = witsmlStartIndex,
                            MaxIndex = witsmlEndIndex
                        }).ToList()
                    });
                }
            }

            if (logIndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD))
            {
                logList =
                [
                    new()
                    {
                        Uid = $"Uid_{WitsmlLog.WITSML_INDEX_TYPE_MD}",
                        Name = $"LogIndexType{WitsmlLog.WITSML_INDEX_TYPE_MD}",
                        UidWell = SourceWellUid,
                        NameWell = SourceWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                        IndexType = logIndexType,
                        LogCurveInfo = LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].Select(mnemonic => new WitsmlLogCurveInfo
                        {
                            Uid = mnemonic,
                            Mnemonic = mnemonic,
                            MinIndex = witsmlStartIndex,
                            MaxIndex = witsmlEndIndex
                        }).ToList()
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
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig2",
                Name = "Rig2",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            return rigs;
        }

        private static IWitsmlObjectList GetRigsTarget(string wellboreUid)
        {
            WitsmlRigs rigs = new();
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig1_Target",
                Name = "Rig1_Target",
                UidWell = SourceWellUid,
                NameWell = SourceWellUid,
                UidWellbore = wellboreUid,
                NameWellbore = wellboreUid,
            });
            rigs.Rigs.Add(new WitsmlRig
            {
                Uid = "Uid_Rig2_Target",
                Name = "Rig2_Target",
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

        private static IWitsmlObjectList GetBhaRunsTarget(string wellboreUid)
        {
            WitsmlBhaRuns runs = new();
            for (int i = 0; i < 10; i++)
            {
                runs.BhaRuns.Add(new WitsmlBhaRun
                {
                    Uid = $"Uid_BhaRun_Target_{i}",
                    Name = $"BhaRun_Target_{i}",
                    UidWell = TargetWellUid,
                    NameWell = TargetWellUid,
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

        private static IWitsmlObjectList GetFluidsReportsTarget(string wellboreUid)
        {
            return new WitsmlFluidsReports()
            {
                FluidsReports =
                [
                    new()
                    {
                        Uid = "Uid_FluidsReport1",
                        Name = "FluidsReport1",
                        UidWell = TargetWellUid,
                        NameWell = TargetWellUid,
                        UidWellbore = wellboreUid,
                        NameWellbore = wellboreUid,
                    },

                    new()
                    {
                        Uid = "Uid_FluidsReport2_Target",
                        Name = "FluidsReport2_Target",
                        UidWell = TargetWellUid,
                        NameWell = TargetWellUid,
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

        private static WellboreSubObjectsComparisonJob CreateJobTemplate()
        {
            WellboreReference targetWellboreRef = new() { WellUid = TargetWellUid, WellboreUid = TargetWellboreUid };
            WellboreReference sourceWellboreRef = new() { WellUid = SourceWellUid, WellboreUid = SourceWellboreUid };

            return new WellboreSubObjectsComparisonJob
            {
                SourceWellbore = sourceWellboreRef,
                TargetWellbore = targetWellboreRef,
                JobInfo = new JobInfo()
                {
                    Id = "1"
                },
                CountLogsData = true,
                CheckLogsData = true,
            };
        }
    }
}
