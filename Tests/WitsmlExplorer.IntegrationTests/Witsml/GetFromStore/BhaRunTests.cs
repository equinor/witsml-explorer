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
    public class BhaRunTests
    {
        private readonly WitsmlClient client;
        private readonly WitsmlClientCapabilities clientCapabilities = new();

        public BhaRunTests()
        {
            var config = ConfigurationReader.GetWitsmlConfiguration();
            client = new WitsmlClient(config.Hostname, config.Username, config.Password, clientCapabilities);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetBhaRun_SerializesCorrectly()
        {
            // if the following bhaRun does not exit, add the fileBhaRun to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            var wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            var wellboreUid = "ae75db48-5cef-4bd1-9ddf-6035b0d2cd49";
            var bhaRunUid = "run-21";
            var queryExisting = BhaRunQueries.GetWitsmlBhaRunByUid(wellUid, wellboreUid, bhaRunUid);
            var serverBhaRun = await client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string serverBhaRunXml = XmlHelper.Serialize(serverBhaRun);
            //disregard commonData times as they are handled by the Witsml Server
            serverBhaRunXml = Regex.Replace(serverBhaRunXml, "<dTimCreation>.+<\\/dTimCreation>", "");
            serverBhaRunXml = Regex.Replace(serverBhaRunXml, "<dTimLastChange>.+<\\/dTimLastChange>", "");

            string fileBhaRunXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "../../../Resources/bhaRun.xml"));
            //handle whitespace
            fileBhaRunXml = Regex.Replace(fileBhaRunXml, ">\\s+<", "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            Assert.Equal(fileBhaRunXml, serverBhaRunXml);
        }

    }
}
