using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Witsml.GetFromStore
{
    public class LogObjectTests
    {
        private readonly WitsmlClient client;
        private readonly WitsmlClientCapabilities clientCapabilities = new();
        private const string IsoPattern = "yyyy-MM-ddTHH:mm:ss.fffZ";

        private const string UidWell = "bbd34996-a1f6-4767-8b02-5e3b46a990e8";
        private const string UidWellbore = "064fc089-fb1d-4302-b85f-a1cd21455314";
        private const string UidLog = "064fc089-fb1d-4302-b85f-a1cd21455314";

        public LogObjectTests()
        {
            var config = ConfigurationReader.GetWitsmlConfiguration();
            client = new WitsmlClient(config.Hostname, config.Username, config.Password, clientCapabilities);
        }

        [Fact]
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
            var (result, resultCode) = await client.GetGrowingDataObjectFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            Assert.Equal(1, resultCode);
            Assert.NotNull(result);
        }

        [Fact]
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
            var (result, resultCode) = await client.GetGrowingDataObjectFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            Assert.Equal(2, resultCode);
            Assert.Equal(10000, result.Logs.First().LogData.Data.Count);
            Assert.NotNull(result);
        }
    }
}
