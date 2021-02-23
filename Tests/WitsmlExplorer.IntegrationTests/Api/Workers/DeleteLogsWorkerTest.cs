using System.Diagnostics.CodeAnalysis;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Jobs;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class DeleteLogsWorkerTests
    {

        private readonly DeleteLogObjectsWorker worker;

        public DeleteLogsWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new DeleteLogObjectsWorker(witsmlClientProvider);
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
                LogReferences = logs
            };
            await worker.Execute(job);
        }
    }
}
