using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ReplaceObjectsWorkerTests
    {
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider;
        private readonly ReplaceObjectsWorker _replaceObjectWorker;
        private readonly CopyObjectsWorker _copyObjectsWorker;
        private readonly DeleteObjectsWorker _deleteObjectsWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;

        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string ObjectUid = "objectUid";
        private static readonly string[] ObjectUids = { "objectUid1", "objectUid2" };

        public ReplaceObjectsWorkerTests()
        {
            _witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);

            Mock<ILogger<CopyObjectsJob>> copyObjectsLogger = new();
            CopyUtils copyUtils = new(new Mock<ILogger<CopyUtils>>().Object);
            CopyLogWorker copyLogWorker = new(new Mock<ILogger<CopyObjectsJob>>().Object, _witsmlClientProvider.Object);
            _copyObjectsWorker = new CopyObjectsWorker(copyObjectsLogger.Object, _witsmlClientProvider.Object, copyUtils, copyLogWorker);

            ILogger<DeleteObjectsJob> deleteObjectsLogger = new Mock<ILogger<DeleteObjectsJob>>().Object;
            _deleteObjectsWorker = new DeleteObjectsWorker(deleteObjectsLogger, _witsmlClientProvider.Object);
            ILogger<ReplaceObjectsJob> replaceObjectsLogger = new Mock<ILogger<ReplaceObjectsJob>>().Object;
            _replaceObjectWorker = new ReplaceObjectsWorker(replaceObjectsLogger, _copyObjectsWorker, _deleteObjectsWorker);
        }

        [Fact]
        public async Task Execute_Delete_Part_ThrowsError()
        {
            SetUpStoreForCopy(true);
            SetUpStoreForDelete(false);
            ReplaceObjectsJob replaceObjectsJob = SetUpReplaceObjectsJob();
            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceObjectWorker.Execute(replaceObjectsJob);
            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Failed to delete some WitsmlTubulars", workerResult.Message);
        }

        [Fact]
        public async Task Execute_Copy_Part_ThrowsError()
        {
            SetUpStoreForCopy(true);
            SetUpStoreForDelete();
            ReplaceObjectsJob replaceObjectsJob = SetUpReplaceObjectsJob();
            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceObjectWorker.Execute(replaceObjectsJob);
            Assert.False(workerResult.IsSuccess);
            Assert.Equal("Could not find any objects to copy", workerResult.Message);
        }

        [Fact]
        public async Task Execute_CopyOneTubular_IsSuccess()
        {
            SetUpStoreForCopy();
            SetUpStoreForDelete();
            ReplaceObjectsJob replaceObjectsJob = SetUpReplaceObjectsJob();
            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceObjectWorker.Execute(replaceObjectsJob);
            Assert.True(workerResult.IsSuccess);
            Assert.Equal(EntityType.Tubular, refreshAction.EntityType);
            Assert.Equal("Copied WitsmlTubulars: objectUid.", workerResult.Message);
        }

        private static ReplaceObjectsJob SetUpReplaceObjectsJob()
        {
            var copyObjectsJob = CreateJobTemplate();
            var deleteObjectsJob = CreateJob(EntityType.Tubular);
            var replaceObjectsJob = new ReplaceObjectsJob()
            {
                CopyJob = copyObjectsJob,
                DeleteJob = deleteObjectsJob
            };
            return replaceObjectsJob;
        }

        private void SetUpStoreForDelete(bool queryResult = true)
        {
            List<IWitsmlQueryType> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
            .Callback<IWitsmlQueryType>(deleteQueries.Add)
            .ReturnsAsync(new QueryResult(true));

            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(
            Match.Create<IWitsmlQueryType>(o =>
                ((WitsmlTubulars)o).Tubulars.First().UidWell == WellUid &&
                ((WitsmlTubulars)o).Tubulars.First().UidWellbore == TargetWellboreUid)))
            .ReturnsAsync(new QueryResult(queryResult));
        }

        private void SetUpStoreForCopy(bool emptyResult = false)
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(witsmlObjects => witsmlObjects.Objects.First().Uid == ObjectUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.All), null))
                .ReturnsAsync(emptyResult ? GetEmptySourceObjects() : GetSourceObjects());
            SetupGetWellbore();
            CopyTestsUtils.SetupAddInStoreAsync<IWitsmlObjectList>(_witsmlClient);
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.Requested), null))
                .ReturnsAsync(new WitsmlWellbores
                {
                    Wellbores = new List<WitsmlWellbore>
                    {
                        new WitsmlWellbore
                        {
                            UidWell = "Well1",
                            Uid = "wellbore1",
                            Name = "Wellbore 1",
                            NameWell = "Well 1"
                        }
                    }
                });
        }

        private static DeleteObjectsJob CreateJob(EntityType objectType)
        {
            return new()
            {
                ToDelete = new ObjectReferences()
                {
                    WellUid = WellUid,
                    WellboreUid = TargetWellboreUid,
                    ObjectUids = ObjectUids,
                    ObjectType = objectType
                }
            };
        }

        private static CopyObjectsJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyObjectsJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { ObjectUid },
                    ObjectType = EntityType.Tubular
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static IWitsmlObjectList GetSourceObjects()
        {
            WitsmlTubular witsmlObject = new()
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = ObjectUid,
            };
            return new WitsmlTubulars
            {
                Objects = new List<WitsmlTubular> { witsmlObject }
            };
        }

        private static IWitsmlObjectList GetEmptySourceObjects()
        {
            return new WitsmlTubulars
            {
                Objects = new List<WitsmlTubular>()
            };
        }
    }
}
