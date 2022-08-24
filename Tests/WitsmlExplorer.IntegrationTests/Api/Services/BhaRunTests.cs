using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Services;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Services
{
    public class BhaRunTests
    {
        private readonly BhaRunService _bhaRunService;
        private readonly ITestOutputHelper _output;

        public BhaRunTests(ITestOutputHelper output)
        {
            _output = output;
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            _bhaRunService = new BhaRunService(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task ReadBhaRun()
        {
            string wellUid = "INSERT";
            string wellboreUid = "INSERT";
            string bhaRunUid = "INSERT";
            _ = await _bhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid);

            _output.WriteLine("To be filled out...");
        }
    }
}
