using System.Collections.Generic;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Create;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class WorkerToolsTests
    {
        private const string LogUid = "8cfad887-3e81-40f0-9034-178be642df65";
        private const string LogName = "Test log";
        private const string WellUid = "W-5209671";
        private const string WellName = "NO 34/10-A-25 C";
        private const string WellboreUid = "B-5209671";
        private const string WellboreName = "NO 34/10-A-25 C - Main Wellbore";
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public WorkerToolsTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        }

        [Fact]
        public async Task GetWellTest_OK()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly))).ReturnsAsync(CreateWells());
            var wellReference = new WellReference() { WellName = "wellname" };
            var well = await WorkerTools.GetWell(_witsmlClient.Object, wellReference, ReturnElements.HeaderOnly);
        }

        [Fact]
        public async Task GetWellBoreTest_OK()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly))).ReturnsAsync(CreateWellbores());
            var wellboreReference = new WellboreReference() { WellName = "wellname", WellboreName = "wellborename"};
            var wellbore = await WorkerTools.GetWellbore(_witsmlClient.Object, wellboreReference, ReturnElements.HeaderOnly);
        }

        private static WitsmlWells CreateWells()
        {
            return new WitsmlWells()
            {
                Wells = new List<WitsmlWell>()
                {
                    new WitsmlWell()
                    {
                        Name = WellName
                    }
                }
            };
        }

        private static WitsmlWellbores CreateWellbores()
        {
            return new WitsmlWellbores()
            {
                Wellbores = new List<WitsmlWellbore>()
                {
                    new WitsmlWellbore()
                    {
                        Name = WellName,
                    }
                }
            };
        }
    }
}
