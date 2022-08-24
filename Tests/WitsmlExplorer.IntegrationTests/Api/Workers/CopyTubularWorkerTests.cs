using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyTubularWorkerTests
    {
        private readonly CopyTubularWorker _worker;

        public CopyTubularWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CopyTubularJob> logger = loggerFactory.CreateLogger<CopyTubularJob>();
            _worker = new CopyTubularWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyTubular()
        {
            CopyTubularJob job = new()
            {
                Source = new TubularReferences
                {
                    WellUid = "f661ed9c-b3ec-46ef-a37b-8ab78f04c142",
                    WellboreUid = "51d8256d-55c6-4eac-9e8f-a801026de278",
                    TubularUids = new string[] { "2YA2M49" }
                },
                Target = new WellboreReference
                {
                    WellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394",
                    WellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110"
                }
            };
            await _worker.Execute(job);
        }
    }
}
