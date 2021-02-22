using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class CopyLogDataWorkerTests
    {
        private readonly CopyLogDataWorker worker;

        public CopyLogDataWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new CopyLogDataWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_TimeIndexed()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var job = new CopyLogDataJob
            {
                LogCurvesReference = new LogCurvesReference
                {
                    LogReference = new LogReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        LogUid = "GM_Date_Time_GMTime"
                    }
                },
                Target = new LogReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    LogUid = "230a60db-54e1-441d-afa6-0807ad308d7a"
                }
            };

            await worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_DepthIndexed()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var job = new CopyLogDataJob
            {
                LogCurvesReference = new LogCurvesReference
                {
                    LogReference = new LogReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        LogUid = "GM_Measured_Depth_GMDepth"
                    }
                },
                Target = new LogReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    LogUid = "974f84b3-88da-4c5d-b318-b111c948dbc3"
                }
            };

            await worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_TimeIndexed_SelectedMnemonics()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var job = new CopyLogDataJob
            {
                LogCurvesReference = new LogCurvesReference
                {
                    LogReference = new LogReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        LogUid = "GM_Date_Time_GMTime"
                    },
                    Mnemonics = new List<string>
                    {
                        "Time",
                        "BLOCKPOS",
                        "DEPTH_BIT",
                        "DEPTH_HOLE"
                    }
                },
                Target = new LogReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    LogUid = "8daba8bd-8d42-4fd0-80e4-b4d1a3a583e3"
                }
            };

            await worker.Execute(job);
        }
    }
}
