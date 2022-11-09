using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class BhaRunTests
    {
        private readonly WitsmlClient _client;
        private readonly WitsmlClientCapabilities _clientCapabilities = new();

        [GeneratedRegex("<dTimLastChange>.+?<\\/dTimLastChange>")]
        private static partial Regex DTimLastChangeRegex();
        [GeneratedRegex("<dTimCreation>.+?<\\/dTimCreation>")]
        private static partial Regex DTimCreationRegex();
        [GeneratedRegex(">\\s+<")]
        private static partial Regex FileTrajectoryRegex();
        public BhaRunTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(config.Hostname, config.Username, config.Password, _clientCapabilities);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetBhaRunSerializesCorrectly()
        {
            // if the following bhaRun does not exit, add the fileBhaRun to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "ae75db48-5cef-4bd1-9ddf-6035b0d2cd49";
            string bhaRunUid = "run-21";
            WitsmlBhaRuns queryExisting = BhaRunQueries.GetWitsmlBhaRun(wellUid, wellboreUid, bhaRunUid);
            WitsmlBhaRuns serverBhaRun = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string serverBhaRunXml = XmlHelper.Serialize(serverBhaRun);
            //disregard commonData times as they are handled by the Witsml Server
            serverBhaRunXml = DTimCreationRegex().Replace(serverBhaRunXml, "");
            serverBhaRunXml = DTimLastChangeRegex().Replace(serverBhaRunXml, "");

            string fileBhaRunXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "../../../Resources/bhaRun.xml"));
            //handle whitespace
            fileBhaRunXml = FileTrajectoryRegex().Replace(fileBhaRunXml, "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            Assert.Equal(fileBhaRunXml, serverBhaRunXml);
        }
    }
}
