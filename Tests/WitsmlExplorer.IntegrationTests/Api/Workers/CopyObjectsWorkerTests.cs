using System.Threading.Tasks;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class CopyObjectsWorkerTests
    {
        private readonly CopyObjectsWorker _worker;

        public CopyObjectsWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<CopyObjectsJob> logger = loggerFactory.CreateLogger<CopyObjectsJob>();
            ICopyUtils copyUtils = new CopyUtils(loggerFactory.CreateLogger<CopyUtils>());

            CopyLogDataWorker copyLogDataWorker = new(witsmlClientProvider, loggerFactory.CreateLogger<CopyLogDataJob>());
            CopyLogWorker copyLogWorker = new(loggerFactory.CreateLogger<CopyObjectsJob>(), witsmlClientProvider, copyLogDataWorker);

            _worker = new CopyObjectsWorker(logger, witsmlClientProvider, copyUtils, copyLogWorker);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task CopyObject()
        {
            CopyObjectsJob job = new()
            {
                Source = new ObjectReferences
                {
                    WellUid = "4d287b3e-9d9c-472a-9b82-d667d9ea1bec",
                    WellboreUid = "a2d2854b-3880-4058-876b-29b14ed7c917",
                    ObjectUids = new string[] { "1YJFL7" },
                    ObjectType = EntityType.Trajectory
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
