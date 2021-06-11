using System.Threading.Tasks;
using WitsmlExplorer.Api.Services;
using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Services
{
    public class MessageObjectTests
    {
        private readonly ITestOutputHelper output;
        private readonly MessageObjectService msgObjectService;

        public MessageObjectTests(ITestOutputHelper output)
        {
            this.output = output;
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            msgObjectService = new MessageObjectService(witsmlClientProvider);
        }

        [Fact()]
        //[Fact(Skip="Should only be run manually")]
        public async Task ReadMessageObject()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var msgUid = "INSERT";

            var msgObject = await msgObjectService.GetMessageObject(wellUid, wellboreUid, msgUid);

            output.WriteLine($"To be filled out...");
        }


    }
}
