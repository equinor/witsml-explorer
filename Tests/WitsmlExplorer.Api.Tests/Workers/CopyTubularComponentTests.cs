using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyTubularComponentWorkerTests
    {
        private readonly CopyTubularComponentsWorker copyTubularComponentWorker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "sourceWellboreUid";
        private const string TargetTubularUid = "targetTubularUid";
        private const string SourceTubularUid = "sourceTubularUid";
        private const string TcUid1 = "TcUid1";
        private const string TcUid2 = "TcUid2";
        private const string TcUid3 = "TcUid3";
        private const string TcUid4 = "TcUid4";

        public CopyTubularComponentWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            copyTubularComponentWorker = new CopyTubularComponentsWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyTubularComponent_CopiedCorrectly()
        {
            var copyTubularComponentJob = CreateJobTemplate();
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(WitsmlTubulars => WitsmlTubulars.Tubulars.First().Uid == SourceTubularUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetSourceTubulars());
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(WitsmlTubulars => WitsmlTubulars.Tubulars.First().Uid == TargetTubularUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetTargetTubulars());
            var copyTubularComponentQuery = SetupUpdateInStoreAsync();

            var result = await copyTubularComponentWorker.Execute(copyTubularComponentJob);
            var updatedTubular = copyTubularComponentQuery.First().Tubulars.First();
            Assert.True(result.Item1.IsSuccess);
            Assert.Equal(TargetTubularUid, updatedTubular.Uid);
            Assert.Empty(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid1));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid2));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid3));
            Assert.Single(updatedTubular.TubularComponents.FindAll((tc) => tc.Uid == TcUid4));
            Assert.Equal(3, updatedTubular.TubularComponents.Count);
        }

        private List<WitsmlTubulars> SetupUpdateInStoreAsync()
        {
            var updatedTubulars = new List<WitsmlTubulars>();
            witsmlClient.Setup(client => client.UpdateInStoreAsync(It.IsAny<WitsmlTubulars>()))
                .Callback<WitsmlTubulars>(witsmlTubulars => updatedTubulars.Add(witsmlTubulars))
                .ReturnsAsync(new QueryResult(true));
            return updatedTubulars;
        }

        private CopyTubularComponentsJob CreateJobTemplate()
        {
            return new CopyTubularComponentsJob
            {
                Source = new TubularComponentReferences
                {
                    TubularReference = new TubularReference
                    {
                        TubularUid = SourceTubularUid,
                        WellboreUid = WellboreUid,
                        WellUid = WellUid
                    },
                    TubularComponentUids = new List<string> { TcUid2, TcUid3 }
                },
                Target = new TubularReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    TubularUid = TargetTubularUid
                }
            };
        }

        private static WitsmlTubulars GetSourceTubulars()
        {
            var witsmlTubular = new WitsmlTubular
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = SourceTubularUid,
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new WitsmlTubularComponent(){
                        Uid = TcUid1,
                    },
                    new WitsmlTubularComponent(){
                        Uid = TcUid2,
                    },
                    new WitsmlTubularComponent(){
                        Uid = TcUid3,
                    }
                },
            };
            return new WitsmlTubulars
            {
                Tubulars = new List<WitsmlTubular> { witsmlTubular }
            };
        }

        private static WitsmlTubulars GetTargetTubulars()
        {
            var witsmlTubular = new WitsmlTubular
            {
                UidWell = WellUid,
                UidWellbore = WellboreUid,
                Uid = TargetTubularUid,
                TubularComponents = new List<WitsmlTubularComponent>
                {
                    new WitsmlTubularComponent(){
                        Uid = TcUid4,
                    }
                },
            };
            return new WitsmlTubulars
            {
                Tubulars = new List<WitsmlTubular> { witsmlTubular }
            };
        }
    }
}
