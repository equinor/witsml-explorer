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
    public class DeleteTrajectoryWorkerTests
    {
        private readonly DeleteTrajectoryWorker _worker;

        public DeleteTrajectoryWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteTrajectoryJob> logger = loggerFactory.CreateLogger<DeleteTrajectoryJob>();
            _worker = new DeleteTrajectoryWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteTrajectory()
        {
            DeleteTrajectoryJob job = new()
            {
                ToDelete = new TrajectoryReference
                {
                    WellUid = "fa53698b-0a19-4f02-bca5-001f5c31c0ca",
                    WellboreUid = "eea43bf8-e3b7-42b6-b328-21b34cb505eb",
                    TrajectoryUid = "1YJFL7"
                }
            };
            await _worker.Execute(job);
        }
    }
}
