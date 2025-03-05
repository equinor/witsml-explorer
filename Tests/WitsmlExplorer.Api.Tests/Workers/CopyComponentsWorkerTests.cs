using System;
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
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyComponentsWorkerTests
    {
        private readonly CopyComponentsWorker _copyComponentsWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string TargetUid = "targetUid";
        private const string SourceUid = "sourceUid";
        private const string Uid1 = "Uid1";
        private const string Uid2 = "Uid2";
        private const string Uid3 = "Uid3";
        private const string Uid4 = "Uid4";

        public CopyComponentsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyComponentsJob>> logger = new();
            _copyComponentsWorker = new CopyComponentsWorker(logger.Object, witsmlClientProvider.Object, new Mock<ICopyLogDataWorker>().Object);
        }

        [Fact]
        public async Task CopyWbGeometrySections_TwoComponentsToCopy_TwoInQuery()
        {
            CopyComponentsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid2, Uid3 }, ComponentType.WbGeometrySection);
            SetupGetFromStoreAsync(ComponentType.WbGeometrySection, new string[] { Uid2, Uid3 }, new string[] { Uid4 });
            List<IWitsmlQueryType> copyWbGeometrySectionQuery = SetupUpdateInStoreAsync();

            (WorkerResult result, RefreshAction _) = await _copyComponentsWorker.Execute(copyWbGeometrySectionJob);
            WitsmlWbGeometry updatedWbGeometry = (WitsmlWbGeometry)((IWitsmlObjectList)copyWbGeometrySectionQuery.First()).Objects.First();

            Assert.True(result.IsSuccess);
            Assert.Equal(TargetUid, updatedWbGeometry.Uid);
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid1));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid2));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid3));
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid4));
            Assert.Equal(2, updatedWbGeometry.WbGeometrySections.Count);
        }

        [Fact]
        public async Task CopyWbGeometrySections_UidToCopyExistsInTarget_JobFails()
        {
            CopyComponentsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid1 }, ComponentType.WbGeometrySection);
            SetupGetFromStoreAsync(ComponentType.WbGeometrySection, new string[] { Uid1 }, new string[] { Uid1, Uid2 });

            (WorkerResult result, RefreshAction _) = await _copyComponentsWorker.Execute(copyWbGeometrySectionJob);
            Assert.False(result.IsSuccess);
        }

        [Fact]
        public async Task CopyWbGeometrySections_UidToCopyDoesNotExistInSource_JobFails()
        {
            CopyComponentsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid1 }, ComponentType.WbGeometrySection);
            SetupGetFromStoreAsync(ComponentType.WbGeometrySection, Array.Empty<string>(), new string[] { Uid3 });

            (WorkerResult result, RefreshAction _) = await _copyComponentsWorker.Execute(copyWbGeometrySectionJob);
            Assert.False(result.IsSuccess);
        }

        [Fact]
        public async Task CopyTubularComponents_OneExistingCopyTwo_CopiedCorrectly()
        {
            List<IWitsmlQueryType> copyTubularComponentQuery = SetupUpdateInStoreAsync();
            CopyComponentsJob copyTubularComponentJob = CreateJobTemplate(new string[] { Uid2, Uid3 }, ComponentType.TubularComponent);
            SetupGetFromStoreAsync(ComponentType.TubularComponent, copyTubularComponentJob.Source.ComponentUids, new string[] { Uid4 });

            (WorkerResult, RefreshAction) result = await _copyComponentsWorker.Execute(copyTubularComponentJob);
            WitsmlTubular updatedTubular = (WitsmlTubular)((IWitsmlObjectList)copyTubularComponentQuery.First()).Objects.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal(TargetUid, updatedTubular.Uid);
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == Uid2));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == Uid3));
            Assert.Empty(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == Uid4));
            Assert.Equal(2, updatedTubular.TubularComponents.Count);
        }

        [Fact]
        public async Task CopyTubularComponents_MissingSourceComponent_UidInErrorReason()
        {
            string missingUid = "uidOfMissingTubularComponent123123";
            CopyComponentsJob copyTubularComponentJob = CreateJobTemplate(new string[] { Uid2, Uid3, missingUid }, ComponentType.TubularComponent);
            SetupGetFromStoreAsync(ComponentType.TubularComponent, new string[] { Uid2, Uid3 }, new string[] { Uid4 });
            (WorkerResult workerResult, _) = await _copyComponentsWorker.Execute(copyTubularComponentJob);

            Assert.False(workerResult.IsSuccess);
            Assert.Contains(missingUid, workerResult.Reason);
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
                client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(query => query.Objects.First().Uid == SourceUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.All), null))
            .ReturnsAsync(GetWitsmlObject(sourceComponentUids, SourceUid, componentType));
            _witsmlClient.Setup(client =>
                    client.GetFromStoreNullableAsync(It.Is<IWitsmlObjectList>(query => query.Objects.First().Uid == TargetUid), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.Requested), null))
            .ReturnsAsync(GetWitsmlObject(targetComponentUids, TargetUid, componentType));
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
