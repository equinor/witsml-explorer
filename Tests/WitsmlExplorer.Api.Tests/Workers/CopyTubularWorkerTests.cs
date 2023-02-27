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

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyTubularWorkerTests
    {
        private readonly CopyTubularWorker _copyTubularWorker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private const string WellUid = "wellUid";
        private const string SourceWellboreUid = "sourceWellboreUid";
        private const string TargetWellboreUid = "targetWellboreUid";
        private const string TubularUid = "tubularUid";

        public CopyTubularWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyTubularJob>> logger = new();
            CopyUtils copyUtils = new(new Mock<ILogger<CopyUtils>>().Object);
            _copyTubularWorker = new CopyTubularWorker(logger.Object, witsmlClientProvider.Object, copyUtils);
        }

        [Fact]
        public async Task CopyTubularOK()
        {
            CopyTubularJob copyTubularJob = CreateJobTemplate();
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.Is<WitsmlTubulars>(witsmlTubulars => witsmlTubulars.Tubulars.First().Uid == TubularUid), new OptionsIn(ReturnElements.All, null, null)))
                .ReturnsAsync(GetSourceTubulars());
            SetupGetWellbore();
            IEnumerable<WitsmlTubulars> copyTubularQuery = CopyTestsUtils.SetupAddInStoreAsync<WitsmlTubulars>(_witsmlClient);

            (WorkerResult, RefreshAction) result = await _copyTubularWorker.Execute(copyTubularJob);
            Assert.True(result.Item1.IsSuccess);
        }

        private void SetupGetWellbore()
        {
            _witsmlClient.Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), new OptionsIn(ReturnElements.Requested, null, null)))
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

        private static CopyTubularJob CreateJobTemplate(string targetWellboreUid = TargetWellboreUid)
        {
            return new CopyTubularJob
            {
                Source = new ObjectReferences
                {
                    WellUid = WellUid,
                    WellboreUid = SourceWellboreUid,
                    ObjectUids = new string[] { TubularUid }
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
            WitsmlTubular witsmlTubular = new()
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
