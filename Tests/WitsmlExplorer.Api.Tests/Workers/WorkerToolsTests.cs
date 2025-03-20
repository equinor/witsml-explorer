using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class WorkerToolsTests
    {
        private const string WellName = "NO 34/10-A-25 C";
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
                client.GetFromStoreAsync(It.IsAny<WitsmlWells>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(CreateWells());
            var wellReference = new WellReference() { WellName = WellName };
            var well = await WorkerTools.GetWell(_witsmlClient.Object, wellReference, ReturnElements.HeaderOnly);
            Assert.Equal(WellName, well.Name);
        }

        [Fact]
        public async Task GetWellBoreTest_OK()
        {
            _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlWellbores>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.HeaderOnly), null)).ReturnsAsync(CreateWellbores());
            var wellboreReference = new WellboreReference() { WellName = WellName, WellboreName = WellboreName };
            var wellbore = await WorkerTools.GetWellbore(_witsmlClient.Object, wellboreReference, ReturnElements.HeaderOnly);
            Assert.Equal(WellboreName, wellbore.Name);
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
                        Name = WellboreName,
                    }
                }
            };
        }
    }
}
