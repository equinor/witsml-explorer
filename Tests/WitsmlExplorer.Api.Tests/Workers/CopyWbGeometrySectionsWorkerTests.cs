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
            CopyWbGeometrySectionsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid2, Uid3 });
            SetupGetFromStoreAsync(new string[] { Uid1, Uid2, Uid3 }, new string[] { Uid4 });
            List<WitsmlWbGeometrys> copyWbGeometrySectionQuery = SetupUpdateInStoreAsync();

            (WorkerResult result, RefreshAction _) = await _copyWbGeometrySectionWorker.Execute(copyWbGeometrySectionJob);
            WitsmlWbGeometry updatedWbGeometry = copyWbGeometrySectionQuery.First().WbGeometrys.First();

            Assert.True(result.IsSuccess);
            Assert.Equal(TargetWbGeometryUid, updatedWbGeometry.Uid);
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid1));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid2));
            Assert.Single(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid3));
            Assert.Empty(updatedWbGeometry.WbGeometrySections.FindAll((wbs) => wbs.Uid == Uid4));
            Assert.Equal(2, updatedWbGeometry.WbGeometrySections.Count);
        }

        [Fact]
        public async Task CopyWbGeometrySection_UidToCopyExistsInTarget_JobFails()
        {
            CopyWbGeometrySectionsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid1 });
            SetupGetFromStoreAsync(new string[] { Uid1 }, new string[] { Uid1, Uid2 });

            (WorkerResult result, RefreshAction _) = await _copyWbGeometrySectionWorker.Execute(copyWbGeometrySectionJob);
            Assert.False(result.IsSuccess);
            Assert.Equal("Failed to copy wbGeometrySections.", result.Message);
        }

        [Fact]
        public async Task CopyWbGeometrySection_UidToCopyDoesNotExistInSource_JobFails()
        {
            CopyWbGeometrySectionsJob copyWbGeometrySectionJob = CreateJobTemplate(new string[] { Uid1 });
            SetupGetFromStoreAsync(new string[] { Uid2 }, new string[] { Uid3 });

            (WorkerResult result, RefreshAction _) = await _copyWbGeometrySectionWorker.Execute(copyWbGeometrySectionJob);
            Assert.False(result.IsSuccess);
            Assert.Equal("Failed to copy wbGeometrySections.", result.Message);
        }

        private void SetupGetFromStoreAsync(string[] sourceSectionUids, string[] targetSectionUids)
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlWbGeometrys>(witsmlWbGeometrys => witsmlWbGeometrys.WbGeometrys.First().Uid == SourceWbGeometryUid), new OptionsIn(ReturnElements.All, null, null)))
                .ReturnsAsync(GetSourceWbGeometrys(sourceSectionUids));
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlWbGeometrys>(witsmlWbGeometrys => witsmlWbGeometrys.WbGeometrys.First().Uid == TargetWbGeometryUid), new OptionsIn(ReturnElements.All, null, null)))
                .ReturnsAsync(GetTargetWbGeometrys(targetSectionUids));
        }

        private List<WitsmlWbGeometrys> SetupUpdateInStoreAsync()
        {
            List<WitsmlWbGeometrys> updatedWbGeometrys = new();
            _witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlWbGeometrys>()))
                .Callback<WitsmlWbGeometrys>(updatedWbGeometrys.Add)
                .ReturnsAsync(new QueryResult(true));
            return updatedWbGeometrys;
        }

        private static CopyWbGeometrySectionsJob CreateJobTemplate(string[] toCopyUids)
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
                    ComponentUids = toCopyUids
                },
                Target = new ObjectReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    Uid = TargetWbGeometryUid
                }
            };
        }

        private static WitsmlWbGeometrys GetSourceWbGeometrys(string[] sectionUids)
        {
            WitsmlWbGeometry witsmlWbGeometry = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceWbGeometryUid,
                WbGeometrySections = sectionUids.Select((uid) => new WitsmlWbGeometrySection()
                {
                    Uid = uid,
                }).ToList()
            };
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new List<WitsmlWbGeometry> { witsmlWbGeometry }
            };
        }

        private static WitsmlWbGeometrys GetTargetWbGeometrys(string[] sectionUids)
        {
            WitsmlWbGeometry witsmlWbGeometry = new()
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetWbGeometryUid,
                WbGeometrySections = sectionUids.Select((uid) => new WitsmlWbGeometrySection()
                {
                    Uid = uid,
                }).ToList()
            };
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new List<WitsmlWbGeometry> { witsmlWbGeometry }
            };
        }
    }
}
