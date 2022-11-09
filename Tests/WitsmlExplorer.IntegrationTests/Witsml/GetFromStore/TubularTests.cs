using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
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
        private readonly WitsmlClientCapabilities _clientCapabilities = new();

        [GeneratedRegex("<dTimCreation>.+?<\\/dTimCreation>")]
        private static partial Regex DTimCreationRegex();
        [GeneratedRegex("<dTimLastChange>.+?<\\/dTimLastChange>")]
        private static partial Regex DTimLastChangeRegex();
        [GeneratedRegex(">\\s+<")]
        private static partial Regex FileTrajectoryRegex();
        public TubularTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(config.Hostname, config.Username, config.Password, _clientCapabilities);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetTubularSerializesCorrectly()
        {
            // if the following tubular does not exit, add the fileTubular to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string tubularUid = "integration_test";
            WitsmlTubulars queryExisting = TubularQueries.GetWitsmlTubular(wellUid, wellboreUid, tubularUid);
            WitsmlTubulars serverTubular = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string serverTubularXml = XmlHelper.Serialize(serverTubular);
            //disregard commonData times as they are handled by the Witsml Server
            serverTubularXml = DTimCreationRegex().Replace(serverTubularXml, "");
            serverTubularXml = DTimLastChangeRegex().Replace(serverTubularXml, "");

            string fileTubularXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "../../../Resources/tubular.xml"));
            //handle whitespace
            fileTubularXml = FileTrajectoryRegex().Replace(fileTubularXml, "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            Assert.Equal(fileTubularXml, serverTubularXml);
        }
    }
}
