using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Witsml.Xml;

using WitsmlExplorer.Api.Query;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class TrajectoryTests
    {
        private readonly WitsmlClient _client;

        public TrajectoryTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetTrajectorySerializesCorrectly()
        {
            // if the following trajectory does not exit, add the file Trajectory to the server manually
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            string wellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394";
            string wellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110";
            string trajectoryUid = "integration_test";
            WitsmlTrajectories queryExisting = TrajectoryQueries.GetWitsmlTrajectoryById(wellUid, wellboreUid, trajectoryUid);
            WitsmlTrajectories serverTrajectory = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverTrajectory);
            string serverTrajectoryXml = TestUtils.CleanResponse(responseXml);
            string fileTrajectoryXml = TestUtils.GetTestXml("trajectory");
            Assert.Equal(fileTrajectoryXml, serverTrajectoryXml);
        }
    }
}
