using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Delete;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class DeleteTubularWorkerTests
    {
        private readonly DeleteTubularsWorker _worker;

        public DeleteTubularWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteTubularsJob> logger = loggerFactory.CreateLogger<DeleteTubularsJob>();
            ILogger<DeleteUtils> logger2 = loggerFactory.CreateLogger<DeleteUtils>();
            DeleteUtils deleteUtils = new(logger2, witsmlClientProvider);
            _worker = new DeleteTubularsWorker(logger, witsmlClientProvider, deleteUtils);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteTubular()
        {
            DeleteTubularsJob job = new()
            {
                ToDelete = new ObjectReferences
                {
                    WellUid = "8c77de13-4fad-4b2e-ba3d-7e6b0e35a394",
                    WellboreUid = "44e7a064-c2f2-4a3a-9259-5ab92085e110",
                    ObjectUids = new string[] { "2YA2M49" }
                }
            };
            await _worker.Execute(job);
        }
    }
}
