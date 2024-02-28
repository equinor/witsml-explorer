using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Services;

using Xunit;
using Xunit.Abstractions;

namespace WitsmlExplorer.IntegrationTests.Api.Services
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class LogObjectServiceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly LogObjectService _logObjectService;

        public LogObjectServiceTests(ITestOutputHelper output)
        {
            this._output = output;
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            _logObjectService = new LogObjectService(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task ReadLogData_TimeIndexed()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var logUid = "GM_Date_Time_GMTime";
            var mnemonics = new List<string> { "Time", "BLOCKPOS", "DEPTH_BIT", "DEPTH_HOLE" };

            var log = await _logObjectService.GetLog(wellUid, wellboreUid, logUid);

            var logData = await _logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics, true, log.StartIndex, log.EndIndex, false);
            _output.WriteLine($"Start: {logData.StartIndex}\tEnd: {logData.EndIndex}\tItems: {logData.Data.Count()}");
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task ReadLogData_DepthIndexed()
        {
            var wellUid = "49eea91c-c648-4de9-812e-5dbfff024da9";
            var wellboreUid = "5dcf13f8-373c-4ba6-a3ee-5d33bd46b63c";
            var logUid = "5fe185a1-dae3-478d-84e2-b44af1559dae";
            var mnemonics = new List<string> { "Depth", "BIT_RPM_AVG", "FLOWIN", "FLOWOUT", "HKLD_AVG" };
            var log = await _logObjectService.GetLog(wellUid, wellboreUid, logUid);
            var logData = await _logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics, true, log.StartIndex, log.EndIndex, false);
            _output.WriteLine($"Start: {logData.StartIndex}\tEnd: {logData.EndIndex}\tItems: {logData.Data.Count()}");
        }
    }
}
