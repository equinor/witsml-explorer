using System.Threading.Tasks;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class TubularTests
    {
        private readonly WitsmlClient _client;

        public TubularTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetTubularSerializesCorrectly()
        {
            // if the following tubular does not exit, add the file Tubular to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string tubularUid = "integration_test";
            WitsmlTubulars queryExisting = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars serverTubular = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverTubular);
            string serverTubularXml = TestUtils.CleanResponse(responseXml);
            string fileTubularXml = TestUtils.GetTestXml("tubular");
            Assert.Equal(fileTubularXml, serverTubularXml);
        }
    }
}
