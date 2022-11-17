using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyWbGeometrySectionsWorkerTests
    {
        private readonly CopyWbGeometrySectionsWorker _copyWbGeometrySectionWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "sourceWellboreUid";
        private const string TargetWbGeometryUid = "targetWbGeometryUid";
        private const string SourceWbGeometryUid = "sourceWbGeometryUid";
        private const string Uid1 = "Uid1";
        private const string Uid2 = "Uid2";
        private const string Uid3 = "Uid3";
        private const string Uid4 = "Uid4";

        public CopyWbGeometrySectionsWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyWbGeometrySectionsJob>> logger = new();
            _copyWbGeometrySectionWorker = new CopyWbGeometrySectionsWorker(logger.Object, witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyWbGeometrySection_TwoComponentsToCopy_TwoInQuery()
        {
            CopyWbGeometrySectionsJob copyWbGeometrySectionJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlWbGeometrys>(witsmlWbGeometrys => witsmlWbGeometrys.WbGeometrys.First().Uid == SourceWbGeometryUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetSourceWbGeometrys());
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlWbGeometrys>(witsmlWbGeometrys => witsmlWbGeometrys.WbGeometrys.First().Uid == TargetWbGeometryUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetTargetWbGeometrys());
            List<WitsmlWbGeometrys> copyWbGeometrySectionQuery = SetupUpdateInStoreAsync();

            (WorkerResult, RefreshAction) result = await _copyWbGeometrySectionWorker.Execute(copyWbGeometrySectionJob);
            WitsmlWbGeometry updatedWbGeometry = copyWbGeometrySectionQuery.First().WbGeometrys.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal(TargetWbGeometryUid, updatedWbGeometry.Uid);
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid1));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid2));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid3));
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid4));
            Assert.Equal(2, updatedWbGeometry.WbGeometrySections.Count);
        }

        private List<WitsmlWbGeometrys> SetupUpdateInStoreAsync()
        {
            List<WitsmlWbGeometrys> updatedWbGeometrys = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWbGeometrys>()))
                .Callback<WitsmlWbGeometrys>(updatedWbGeometrys.Add)
                .ReturnsAsync(new QueryResult(true));
            return updatedWbGeometrys;
        }

        private static CopyWbGeometrySectionsJob CreateJobTemplate()
        {
            return new CopyWbGeometrySectionsJob
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        Uid = SourceWbGeometryUid,
                        WellboreUid = WellboreUid,
                        WellUid = WellUid
                    },
                    ComponentUids = new string[] { Uid2, Uid3 }
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetWbGeometryUid
                }
            };
        }

        private static WitsmlWbGeometrys GetSourceWbGeometrys()
        {
            WitsmlWbGeometry witsmlWbGeometry = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceWbGeometryUid,
                WbGeometrySections = new List<WitsmlWbGeometrySection>
                {
                    new WitsmlWbGeometrySection(){
                        Uid = Uid1,
                    },
                    new WitsmlWbGeometrySection(){
                        Uid = Uid2,
                    },
                    new WitsmlWbGeometrySection(){
                        Uid = Uid3,
                    }
                },
            };
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new List<WitsmlWbGeometry> { witsmlWbGeometry }
            };
        }

        private static WitsmlWbGeometrys GetTargetWbGeometrys()
        {
            WitsmlWbGeometry witsmlWbGeometry = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetWbGeometryUid,
                WbGeometrySections = new List<WitsmlWbGeometrySection>
                {
                    new WitsmlWbGeometrySection(){
                        Uid = Uid4,
                    }
                },
            };
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new List<WitsmlWbGeometry> { witsmlWbGeometry }
            };
        }
    }
}
