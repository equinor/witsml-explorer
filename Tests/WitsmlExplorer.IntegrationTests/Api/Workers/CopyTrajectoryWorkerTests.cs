using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyTrajectoryWorkerTests
    {
        private readonly CopyTrajectoryWorker _worker;

        public CopyTrajectoryWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CopyTrajectoryJob> logger = loggerFactory.CreateLogger<CopyTrajectoryJob>();
            ICopyUtils copyUtils = new CopyUtils(loggerFactory.CreateLogger<CopyUtils>());

            _worker = new CopyTrajectoryWorker(logger, witsmlClientProvider, copyUtils);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyTrajectory()
        {
            CopyTrajectoryJob job = new()
            {
                Source = new ObjectReferences
                {
                    WellUid = "4d287b3e-9d9c-472a-9b82-d667d9ea1bec",
                    WellboreUid = "a2d2854b-3880-4058-876b-29b14ed7c917",
                    ObjectUids = new string[] { "1YJFL7" }
                },
                Target = new WellboreReference
                {
                    WellUid = "fa53698b-0a19-4f02-bca5-001f5c31c0ca",
                    WellboreUid = "70507fdf-4b01-4d62-a642-5f154c57440d"
                }
            };
            await _worker.Execute(job);
        }
    }
}
