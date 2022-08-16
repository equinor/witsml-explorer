using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class DeleteLogsWorkerTests
    {

        private readonly DeleteLogObjectsWorker _worker;

        public DeleteLogsWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<DeleteLogObjectsJob>();
            var logger2 = loggerFactory.CreateLogger<DeleteUtils>();
            _worker = new DeleteLogObjectsWorker(logger, witsmlClientProvider, new DeleteUtils(logger2, witsmlClientProvider));
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task DeleteLogs()
        {
            var logs = new LogReference[] {
                new LogReference{ WellUid = "<well_uid>", WellboreUid = "<wellbore_uid>", LogUid = "<log_uid_1>" },
                new LogReference{ WellUid = "<well_uid>", WellboreUid = "<wellbore_uid>", LogUid = "<log_uid_2>" }
            };
            var job = new DeleteLogObjectsJob()
            {
                ToDelete = new LogReferences() { LogReferenceList = logs }
            };
            await _worker.Execute(job);
        }
    }
}
