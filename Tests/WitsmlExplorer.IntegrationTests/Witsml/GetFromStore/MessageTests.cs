using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public class MessageTests
    {
        private readonly WitsmlClient _client;

        public MessageTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetMessageSerializesCorrectly()
        {
            // if the following message does not exit, add the file Message to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string messageUid = "integration_test";
            WitsmlMessages queryExisting = MessageQueries.GetMessageById(wellUid, wellboreUid, messageUid);
            WitsmlMessages serverMessage = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverMessage);
            string serverMessageXml = TestUtils.CleanResponse(responseXml);
            string fileMessageXml = TestUtils.GetTestXml("message");
            Assert.Equal(fileMessageXml, serverMessageXml);
        }
    }
}
