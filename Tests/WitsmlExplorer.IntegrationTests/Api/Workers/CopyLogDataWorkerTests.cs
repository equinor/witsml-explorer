using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyLogDataWorkerTests
    {
        private readonly CopyLogDataWorker _worker;

        public CopyLogDataWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            _worker = new CopyLogDataWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_TimeIndexed()
        {
            string wellUid = "W-5232880";
            string wellboreUid = "B-5232880";
            CopyLogDataJob job = new()
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        Uid = "GM_Date_Time_GMTime"
                    }
                },
                Target = new ObjectReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    Uid = "230a60db-54e1-441d-afa6-0807ad308d7a"
                }
            };

            await _worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_DepthIndexed()
        {
            string wellUid = "W-5232880";
            string wellboreUid = "B-5232880";
            CopyLogDataJob job = new()
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        Uid = "GM_Measured_Depth_GMDepth"
                    }
                },
                Target = new ObjectReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    Uid = "974f84b3-88da-4c5d-b318-b111c948dbc3"
                }
            };

            await _worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyLogData_TimeIndexed_SelectedComponentUids()
        {
            string wellUid = "W-5232880";
            string wellboreUid = "B-5232880";
            CopyLogDataJob job = new()
            {
                Source = new ComponentReferences
                {
                    Parent = new ObjectReference
                    {
                        WellUid = wellUid,
                        WellboreUid = wellboreUid,
                        Uid = "GM_Date_Time_GMTime"
                    },
                    ComponentUids = new string[]
                    {
                        "Time",
                        "BLOCKPOS",
                        "DEPTH_BIT",
                        "DEPTH_HOLE"
                    }
                },
                Target = new ObjectReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    Uid = "8daba8bd-8d42-4fd0-80e4-b4d1a3a583e3"
                }
            };

            await _worker.Execute(job);
        }
    }
}
