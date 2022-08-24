using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Services;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Services
{
    public class MessageObjectTests
    {
        private readonly MessageObjectService _msgObjectService;
        private readonly ITestOutputHelper _output;

        public MessageObjectTests(ITestOutputHelper output)
        {
            _output = output;
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            _msgObjectService = new MessageObjectService(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task ReadMessageObject()
        {
            string wellUid = "INSERT";
            string wellboreUid = "INSERT";
            string msgUid = "INSERT";
            _ = await _msgObjectService.GetMessageObject(wellUid, wellboreUid, msgUid);

            _output.WriteLine("To be filled out...");
        }
    }
}
