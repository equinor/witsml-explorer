using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;
using Serilog;
using Microsoft.Extensions.Logging;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class CopyTrajectoryWorkerTests
    {
        private readonly CopyTrajectoryWorker worker;
        private readonly DeleteTrajectoryWorker deleteLogWorker;
        private readonly IWitsmlClient client;

        public CopyTrajectoryWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            client = witsmlClientProvider.GetClient();
            var loggerFactory = (ILoggerFactory) new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<CopyTrajectoryWorker>();

            worker = new CopyTrajectoryWorker(logger, witsmlClientProvider);
            deleteLogWorker = new DeleteTrajectoryWorker(witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyTrajectory()
        {
            var job = new CopyTrajectoryJob
            {
                Source = new TrajectoryReference
                {
                    WellUid = "4d287b3e-9d9c-472a-9b82-d667d9ea1bec",
                    WellboreUid = "a2d2854b-3880-4058-876b-29b14ed7c917",
                    TrajectoryUid = "1YJFL7"
                },
                Target = new WellboreReference
                {
                    WellUid = "fa53698b-0a19-4f02-bca5-001f5c31c0ca",
                    WellboreUid = "70507fdf-4b01-4d62-a642-5f154c57440d"
                }
            };
            await worker.Execute(job);
        }
    }
}
