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
    public class DeleteLogsWorkerTests
    {

        private readonly DeleteLogObjectsWorker _worker;

        public DeleteLogsWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<DeleteLogObjectsJob> logger = loggerFactory.CreateLogger<DeleteLogObjectsJob>();
            ILogger<DeleteUtils> logger2 = loggerFactory.CreateLogger<DeleteUtils>();
            _worker = new DeleteLogObjectsWorker(logger, witsmlClientProvider, new DeleteUtils(logger2));
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteLogs()
        {
            DeleteLogObjectsJob job = new()
            {
                ToDelete = new ObjectReferences() { WellUid = "<well_uid>", WellboreUid = "<wellbore_uid>", ObjectUids = new string[] { "<log_uid_1>", "<log_uid_2>" } }
            };
            await _worker.Execute(job);
        }
    }
}
