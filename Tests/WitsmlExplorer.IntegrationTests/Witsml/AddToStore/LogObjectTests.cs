using System;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Query;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Witsml.AddToStore
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class LogObjectTests
    {
        private readonly ITestOutputHelper _output;
        private readonly WitsmlClient _client;

        public LogObjectTests(ITestOutputHelper output)
        {
            _output = output;
            WitsmlConfiguration config = ConfigurationReader.GetWitsmlConfiguration();
            _client = new WitsmlClient(options =>
            {
                options.Hostname = config.Hostname;
                options.Credentials = new WitsmlCredentials(config.Username, config.Password);
            });
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateLogObjectBasedOnExisting()
        {
            string wellUid = "W-5232880";
            string wellboreUid = "B-5232880";
            string logUid = "GM_Measured_Depth_GMDepth";
            WitsmlLogs queryExisting = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs existingLogs = await _client.GetFromStoreAsync(queryExisting, new OptionsIn(ReturnElements.All));
            WitsmlLog existing = existingLogs.Logs.First();

            WitsmlLogs createLogQuery = CreateLogQuery(
                existing.UidWell,
                existing.NameWell,
                existing.UidWellbore,
                existing.NameWellbore,
                existing.Name + " (interval)",
                existing.IndexType,
                existing.IndexCurve,
                existing.LogCurveInfo.Single(logCurveInfo => logCurveInfo.Mnemonic == existing.IndexCurve.Value));

            QueryResult result = await _client.AddToStoreAsync(createLogQuery);

            Assert.True(result.IsSuccessful);
            _output.WriteLine("Created log object with uid: " + createLogQuery.Logs.First().Uid);

        }

        private static WitsmlLogs CreateLogQuery(string wellUid, string wellName, string wellboreUid, string wellboreName, string name, string indexType,
            WitsmlIndexCurve indexCurve, WitsmlLogCurveInfo indexLogCurveInfo)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    NameWell = wellName,
                    UidWellbore = wellboreUid,
                    NameWellbore = wellboreName,
                    Name = name,
                    Uid = Guid.NewGuid().ToString(),
                    IndexType = indexType,
                    IndexCurve = new WitsmlIndexCurve
                    {
                        ColumnIndex = indexCurve.ColumnIndex,
                        Value = indexCurve.Value
                    },
                    LogCurveInfo = new WitsmlLogCurveInfo
                    {
                        Uid = indexLogCurveInfo.Uid,
                        Mnemonic = indexCurve.Value,
                        CurveDescription = string.IsNullOrEmpty(indexLogCurveInfo.CurveDescription) ? null : indexLogCurveInfo.CurveDescription,
                        Unit = string.IsNullOrEmpty(indexLogCurveInfo.Unit) ? null : indexLogCurveInfo.Unit,
                        TypeLogData = indexLogCurveInfo.TypeLogData,
                        MinIndex = null,
                        MaxIndex = null,
                        MinDateTimeIndex = null,
                        MaxDateTimeIndex = null
                    }.AsItemInList()
                }.AsItemInList()
            };
        }

    }
}
