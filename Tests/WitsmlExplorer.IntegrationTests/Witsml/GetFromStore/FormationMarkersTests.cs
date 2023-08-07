using System.Collections.Generic;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public class FormationMarkersTests
    {
        private readonly WitsmlClient _client;

        private const string UidWell = "94f01089-84d3-4cec-9448-303c508ddb9e";
        private const string UidWellbore = "c4ef4f85-5692-4f62-91b2-f26dce721501";

        public FormationMarkersTests()
        {
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetFormationMarkersFromStoreAsync()
        {
            WitsmlFormationMarkers query = new()
            {
                FormationMarkers = new List<WitsmlFormationMarker>
            {
                new()
                {
                    UidWell = UidWell,
                    UidWellbore = UidWellbore
                }
            }
            };
            WitsmlFormationMarkers formationMarkers = await _client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            Assert.True(formationMarkers.FormationMarkers.Count > 0);
        }
    }
}
