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
    public class DeleteTrajectoriesWorkerTests
    {
        private readonly DeleteTrajectoriesWorker _worker;

        public DeleteTrajectoriesWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteTrajectoriesJob> logger = loggerFactory.CreateLogger<DeleteTrajectoriesJob>();
            ILogger<DeleteUtils> logger2 = loggerFactory.CreateLogger<DeleteUtils>();
            DeleteUtils deleteUtils = new(logger2);
            _worker = new DeleteTrajectoriesWorker(logger, witsmlClientProvider, deleteUtils);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteTrajectory()
        {
            DeleteTrajectoriesJob job = new()
            {
                ToDelete = new ObjectReferences
                {
                    WellUid = "fa53698b-0a19-4f02-bca5-001f5c31c0ca",
                    WellboreUid = "eea43bf8-e3b7-42b6-b328-21b34cb505eb",
                    ObjectUids = new string[] { "1YJFL7" }
                }
            };
            await _worker.Execute(job);
        }
    }
}
