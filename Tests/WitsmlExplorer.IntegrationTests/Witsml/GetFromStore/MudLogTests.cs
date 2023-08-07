using System.Threading.Tasks;

using Witsml;
using Witsml.Data.MudLog;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class MudLogTests
    {
        private readonly WitsmlClient _client;

        public MudLogTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetMudLogSerializesCorrectly()
        {
            // if the following mudLog does not exit, add the file MudLog to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string mudLogUid = "integration_test";
            WitsmlMudLogs queryExisting = MudLogQueries.QueryById(wellUid, wellboreUid, new[] { mudLogUid });
            WitsmlMudLogs serverMudLog = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverMudLog);
            string serverMudLogXml = TestUtils.CleanResponse(responseXml);
            string fileMudLogXml = TestUtils.GetTestXml("mudLog");
            Assert.Equal(fileMudLogXml, serverMudLogXml);
        }
    }
}
