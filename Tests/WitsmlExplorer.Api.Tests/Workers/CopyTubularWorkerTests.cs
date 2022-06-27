using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyTubularWorkerTests
    {
        private readonly CopyTubularWorker copyTubularWorker;
        private readonly Mock<IWitsmlClient> witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string TubularUid = "tubularUid";

        public CopyTubularWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            copyTubularWorker = new CopyTubularWorker(witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CopyTubular_OK()
        {
            var copyTubularJob = CreateJobTemplate();
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(WitsmlTubulars => WitsmlTubulars.Tubulars.First().Uid == TubularUid), new OptionsIn(ReturnElements.All, null)))
                .ReturnsAsync(GetSourceTubulars());
            SetupGetWellbore();
            var copyTubularQuery = SetupAddInStoreAsync();

            var result = await copyTubularWorker.Execute(copyTubularJob);
            Assert.True(result.Item1.IsSuccess);
        }

        private void SetupGetWellbore()
        {
            witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null)))
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

        private List<WitsmlTubulars> SetupAddInStoreAsync()
        {
            var addedTubular = new List<WitsmlTubulars>();
            witsmlClient.Setup(client => client.AddToStoreAsync(It.IsAny<WitsmlTubulars>()))
                .Callback<WitsmlTubulars>(witsmlTubulars => addedTubular.Add(witsmlTubulars))
                .ReturnsAsync(new QueryResult(true));
            return addedTubular;
        }

        private static CopyTubularJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyTubularJob
            {
                Source = new TubularReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    TubularUids = new string[] { TubularUid }
                },
                Target = new WellboreReference
                {
                    WellUid = WellUid,
                    WellboreUid = targetWellboreUid
                }
            };
        }

        private static WitsmlTubulars GetSourceTubulars()
        {
            var witsmlTubular = new WitsmlTubular
            {
                UidWell = WellUid,
                UidWellbore = SourceWellboreUid,
                Uid = TubularUid,
                NameWell = "",
                NameWellbore = "",
                Name = "",
                CommonData = new WitsmlCommonData(),
                CustomData = new WitsmlCustomData()
            };
            return new WitsmlTubulars
            {
                Tubulars = new List<WitsmlTubular> { witsmlTubular }
            };
        }
    }
}
