using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public class LogObjectTests
    {
        private readonly WitsmlClient _client;
        private const string IsoPattern = "yyyy-MM-ddTHH:mm:ss.fffZ";

        private const string UidWell = "bbd34996-a1f6-4767-8b02-5e3b46a990e8";
        private const string UidWellbore = "064fc089-fb1d-4302-b85f-a1cd21455314";
        private const string UidLog = "064fc089-fb1d-4302-b85f-a1cd21455314";

        private const string UidWellDepth = "64457931-c280-4eee-8d58-8f2f27d02807";
        private const string UidWellboreDepth = "d171f23a-750d-4415-b8e5-b8d57bb48d6d";
        private const string UidLogDepth = "GM_Measured_Depth_GMDepth";

        public LogObjectTests()
        {
            var config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetGrowingDataObjectFromStoreAsync_ShortTimeSpan_Returns_ResultCode_1()
        {
            var endIndex = new DateTime(2021, 11, 3, 12, 0, 0);
            var startIndex = endIndex.Subtract(TimeSpan.FromHours(1));
            var query = new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        UidWell = UidWell,
                        UidWellbore = UidWellbore,
                        Uid = UidLog,
                        StartDateTimeIndex = startIndex.ToString(IsoPattern),
                        EndDateTimeIndex = endIndex.ToString(IsoPattern)
                    }
                }
            };
            var (result, resultCode) = await _client.GetGrowingDataObjectFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            Assert.Equal(1, resultCode);
            Assert.NotNull(result);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetGrowingDataObjectFromStoreAsync_LongTimeSpan_Returns_ResultCode_2()
        {
            var endIndex = new DateTime(2021, 11, 3, 12, 0, 0);
            var startIndex = endIndex.Subtract(TimeSpan.FromHours(24));
            var query = new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        UidWell = UidWell,
                        UidWellbore = UidWellbore,
                        Uid = UidLog,
                        StartDateTimeIndex = startIndex.ToString(IsoPattern),
                        EndDateTimeIndex = endIndex.ToString(IsoPattern)
                    }
                }
            };
            var (result, resultCode) = await _client.GetGrowingDataObjectFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            Assert.Equal(2, resultCode);
            Assert.Equal(10000, result.Logs.First().LogData.Data.Count);
            Assert.NotNull(result);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task GetDepthDataObjectFromStoreAsync_ParseInvariant()
        {
            CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("nb-NO");
            var query = new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = UidLogDepth,
                    UidWell = UidWellDepth,
                    UidWellbore = UidWellboreDepth

                }.AsItemInList()
            };

            var result = await _client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            var witsmlLog = result.Logs.First();
            var data = witsmlLog.LogData.Data;
            data.First().GetRow(); // Test fails if parsing error on GetRow() due to incompatible culture setting.
        }
    }
}
