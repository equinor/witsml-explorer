using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class CreateLogWorkerTests
    {
        private readonly CreateLogWorker worker;
        private static string WELL_UID = "fa53698b-0a19-4f02-bca5-001f5c31c0ca";
        private static string WELLBORE_UID = "eea43bf8-e3b7-42b6-b328-21b34cb505eb";

        public CreateLogWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new CreateLogWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateLog_DepthIndexed()
        {
            var job = new CreateLogJob
            {
                LogObject = new LogObject
                {
                    Uid = Guid.NewGuid().ToString(),
                    Name = "Test depth",
                    WellUid = WELL_UID,
                    WellboreUid = WELLBORE_UID,
                    IndexCurve = "Depth"
                }
            };

            await worker.Execute(job);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CreateLog_TimeIndexed()
        {
            var job = new CreateLogJob
            {
                LogObject = new LogObject
                {
                    Uid = Guid.NewGuid().ToString(),
                    Name = "Test time",
                    WellUid = WELL_UID,
                    WellboreUid = WELLBORE_UID,
                    IndexCurve = "Time"
                }
            };

            await worker.Execute(job);
        }
    }
}
