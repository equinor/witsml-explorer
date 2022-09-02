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
    public class TrajectoryTests
    {
        private readonly WitsmlClient _client;
        private readonly WitsmlClientCapabilities _clientCapabilities = new();

        public TrajectoryTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(config.Hostname, config.Username, config.Password, _clientCapabilities);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetTrajectorySerializesCorrectly()
        {
            // if the following trajectory does not exit, add the fileTrajectory to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string trajectoryUid = "integration_test";
            WitsmlTrajectories queryExisting = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories serverTrajectory = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string serverTrajectoryXml = XmlHelper.Serialize(serverTrajectory);
            //disregard commonData times as they are handled by the Witsml Server
            serverTrajectoryXml = Regex.Replace(serverTrajectoryXml, "<dTimCreation>.+?<\\/dTimCreation>", "");
            serverTrajectoryXml = Regex.Replace(serverTrajectoryXml, "<dTimLastChange>.+?<\\/dTimLastChange>", "");

            string fileTrajectoryXml = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "../../../Resources/trajectory.xml"));
            //handle whitespace
            fileTrajectoryXml = Regex.Replace(fileTrajectoryXml, ">\\s+<", "><").Replace("\t", " ").Replace("\n", "").Replace("\r", "");
            Assert.Equal(fileTrajectoryXml, serverTrajectoryXml);
        }

    }
}
