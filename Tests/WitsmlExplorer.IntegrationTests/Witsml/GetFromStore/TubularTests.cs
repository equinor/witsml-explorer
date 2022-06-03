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
    public class TubularTests
    {
        private readonly WitsmlClient client;
        private readonly WitsmlClientCapabilities clientCapabilities = new();

        public TubularTests()
        {
            var config = ConfigurationReader.GetWitsmlConfiguration();
            client = new WitsmlClient(config.Hostname, config.Username, config.Password, clientCapabilities);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetTubular_SerializesCorrectly()
        {
            // if the following tubular does not exit, add the fileTubular to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            var wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            var wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            var tubularUid = "integration_test";
            var queryExisting = TubularQueries.GetWitsmlTubularById(wellUid, wellboreUid, tubularUid);
            var serverTubular = await client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string serverTubularXml = XmlHelper.Serialize(serverTubular);
            //disregard commonData times as they are handled by the Witsml Server
            serverTubularXml = Regex.Replace(serverTubularXml, "<dTimCreation>.+<\\/dTimCreation>", "");
            serverTubularXml = Regex.Replace(serverTubularXml, "<dTimLastChange>.+<\\/dTimLastChange>", "");

            string fileTubularXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "../../../Resources/tubular.xml"));
            //handle whitespace
            fileTubularXml = Regex.Replace(fileTubularXml, ">\\s+<", "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            Assert.Equal(fileTubularXml, serverTubularXml);
        }

    }
}
