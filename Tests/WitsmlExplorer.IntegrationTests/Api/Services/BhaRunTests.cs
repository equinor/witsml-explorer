using System.Threading.Tasks;

using WitsmlExplorer.Api.Services;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Services
{
    public class BhaRunTests
    {
        private readonly BhaRunService bhaRunService;
        private readonly ITestOutputHelper output;

        public BhaRunTests(ITestOutputHelper output)
        {
            this.output = output;
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            bhaRunService = new BhaRunService(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task ReadBhaRun()
        {
            var wellUid = "INSERT";
            var wellboreUid = "INSERT";
            var bhaRunUid = "INSERT";

            var bhaRun = await bhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid);

            output.WriteLine("To be filled out...");
        }
    }
}
