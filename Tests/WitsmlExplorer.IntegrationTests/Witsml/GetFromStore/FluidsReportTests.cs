using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Witsml.Xml;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public partial class FluidsReportTests
    {
        private readonly WitsmlClient _client;

        public FluidsReportTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetFluidsReportSerializesCorrectly()
        {
            // if the following fluidsReport does not exit, add the file FluidsReport to the server manually (such as by using PDS WITSMLstudio)
            // this affects wellUid, wellboreUid, nameWell, and nameWellbore values during comparison so adjust them here and in the file accordingly
            const string wellUid = "jbura";
            const string wellboreUid = "jbura";
            const string fluidsReportUid = "integration_test";
            WitsmlFluidsReports queryExisting = new WitsmlFluidsReport()
            {
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                Uid = fluidsReportUid
            }.AsItemInWitsmlList();
            WitsmlFluidsReports serverFluidsReport = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            string responseXml = XmlHelper.Serialize(serverFluidsReport);
            string serverFluidsReportXml = TestUtils.CleanResponse(responseXml);
            string fileFluidsReportXml = TestUtils.GetTestXml("fluidsReport");
            Assert.Equal(fileFluidsReportXml, serverFluidsReportXml);
        }
    }
}
