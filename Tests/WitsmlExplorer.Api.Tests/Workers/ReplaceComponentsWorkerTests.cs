using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class ReplaceComponentsWorkerTests
    {
        private const string WellboreUid = "wellboreUid";
        private const string TargetUid = "targetUid";
        private const string SourceUid = "sourceUid";
        private const string Uid2 = "Uid2";
        private const string Uid3 = "Uid3";
        private const string Uid4 = "Uid4";

        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider;
        private readonly ReplaceComponentsWorker _replaceComponentsWorker;
        private readonly CopyComponentsWorker _copyComponentsWorker;
        private readonly DeleteComponentsWorker _deleteComponentsWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string ObjectUid = "objectUid";
        private static readonly string[] ComponentUids = new string[] { "componentUid1", "componentUid2" };

        public ReplaceComponentsWorkerTests()
        {
            _witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyComponentsJob>> copyComponentLogger = new();
            CopyUtils copyUtils = new(new Mock<ILogger<CopyUtils>>().Object);
            CopyLogWorker copyLogWorker = new(new Mock<ILogger<CopyObjectsJob>>().Object, _witsmlClientProvider.Object);

            _copyComponentsWorker = new CopyComponentsWorker(copyComponentLogger.Object, _witsmlClientProvider.Object, new Mock<ICopyLogDataWorker>().Object);
            ILogger<DeleteComponentsJob> deleteComponentLogger = new Mock<ILogger<DeleteComponentsJob>>().Object;
            _deleteComponentsWorker = new DeleteComponentsWorker(deleteComponentLogger, _witsmlClientProvider.Object);
            ILogger<ReplaceComponentsJob> replaceComponentLogger = new Mock<ILogger<ReplaceComponentsJob>>().Object;
            _replaceComponentsWorker = new ReplaceComponentsWorker(replaceComponentLogger, _copyComponentsWorker, _deleteComponentsWorker);
        }

        [Fact]
        public async Task Execute_ReplaceTubularComponents_Delete_Failure()
        {
            List<IWitsmlQueryType> copyTubularComponentQuery = SetupUpdateInStoreAsync();
            CopyComponentsJob copyTubularComponentJob = CreateJobTemplate(new string[] { Uid2, Uid3 }, ComponentType.TubularComponent);
            SetupGetFromStoreAsync(ComponentType.TubularComponent, copyTubularComponentJob.Source.ComponentUids, new string[] { Uid4 });
            SetUpStoreForDelete(false);

            var deleteObjectsJob = CreateJob(ComponentType.TubularComponent);
            ReplaceComponentsJob replaceObjectsJob = new ReplaceComponentsJob()
            {
                CopyJob = copyTubularComponentJob,
                DeleteJob = deleteObjectsJob
            };

            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceComponentsWorker.Execute(replaceObjectsJob);
            Assert.False(workerResult.IsSuccess);
        }

        [Fact]
        public async Task Execute_ReplaceTubularComponents_CopyFailureSuccess()
        {
            SetupUpdateInStoreAsync();
            string missingUid = "uidOfMissingTubularComponent123123";
            CopyComponentsJob copyTubularComponentJob = CreateJobTemplate(new string[] { Uid2, Uid3, missingUid }, ComponentType.TubularComponent);
            SetupGetFromStoreAsync(ComponentType.TubularComponent, new string[] { Uid2, Uid3 }, new string[] { Uid4 });
            SetUpStoreForDelete();

            var deleteObjectsJob = CreateJob(ComponentType.TubularComponent);
            var replaceObjectsJob = new ReplaceComponentsJob()
            {
                CopyJob = copyTubularComponentJob,
                DeleteJob = deleteObjectsJob,
                JobInfo = new()
            };

            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceComponentsWorker.Execute(replaceObjectsJob);
            Assert.False(workerResult.IsSuccess);
        }

        [Fact]
        public async Task Execute_ReplaceTubularComponents_IsSuccess()
        {
            SetupUpdateInStoreAsync();
            CopyComponentsJob copyTubularComponentJob = CreateJobTemplate(new string[] { Uid2, Uid3 }, ComponentType.TubularComponent);
            SetupGetFromStoreAsync(ComponentType.TubularComponent, copyTubularComponentJob.Source.ComponentUids, new string[] { Uid4 });
            SetUpStoreForDelete();

            var deleteObjectsJob = CreateJob(ComponentType.TubularComponent);
            ReplaceComponentsJob replaceObjectsJob = new ReplaceComponentsJob()
            {
                CopyJob = copyTubularComponentJob,
                DeleteJob = deleteObjectsJob,
                JobInfo = new ()
            };

            (WorkerResult workerResult, RefreshAction refreshAction) = await _replaceComponentsWorker.Execute(replaceObjectsJob);
            Assert.True(workerResult.IsSuccess);
            Assert.Equal(EntityType.Tubular, refreshAction.EntityType);
        }

        private void SetUpStoreForDelete(bool deleteResult = true)
        {
            List<IWitsmlQueryType> deleteQueries = new();
            _witsmlClient.Setup(client => client.DeleteFromStoreAsync(It.IsAny<IWitsmlQueryType>()))
            .Callback<IWitsmlQueryType>(deleteQueries.Add)
            .ReturnsAsync(new QueryResult(deleteResult));
        }

        private List<IWitsmlQueryType> SetupUpdateInStoreAsync()
        {
            List<IWitsmlQueryType> updateQueries = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>()))
                .Callback<IWitsmlQueryType>(updateQueries.Add)
                .ReturnsAsync(new QueryResult(true));
            return updateQueries;
        }

        private void SetupGetFromStoreAsync(ComponentType componentType, string[] sourceComponentUids, string[] targetComponentUids)
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(query => query.Objects.First().Uid == SourceUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.All)))
            .ReturnsAsync(GetWitsmlObject(sourceComponentUids, SourceUid, componentType));
            _witsmlClient.Setup(client =>
                    client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(query => query.Objects.First().Uid == TargetUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.Requested)))
            .ReturnsAsync(GetWitsmlObject(targetComponentUids, TargetUid, componentType));
        }

        private static DeleteComponentsJob CreateJob(ComponentType componentType)
        {
            return new()
            {
                ToDelete = new ComponentReferences()
                {
                    ComponentUids = ComponentUids,
                    ComponentType = componentType,
                    Parent = new ObjectReference()
                    {
                        WellUid = WellUid,
                        WellboreUid = WellboreUid,
                        Uid = ObjectUid,
                    }
                }
            };
        }

        private static CopyComponentsJob CreateJobTemplate(string[] toCopyUids, ComponentType componentType)
        {
            return new CopyComponentsJob
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        Uid = SourceUid,
                        WellboreUid = WellboreUid,
                        WellUid = WellUid
                    },
                    ComponentUids = toCopyUids,
                    ComponentType = componentType
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetUid
                }
            };
        }

        private static IWitsmlObjectList GetWitsmlObject(string[] componentUids, string uid, ComponentType componentType)
        {
            WitsmlObjectOnWellbore source = EntityTypeHelper.ToObjectOnWellbore(componentType.ToParentType());
            source.UidWell = WellUid;
            source.UidWellbore = WellboreUid;
            source.Uid = uid;
            ObjectQueries.SetComponents(source, componentType, componentUids);
            return (IWitsmlObjectList)source.AsItemInWitsmlList();
        }
    }
}
