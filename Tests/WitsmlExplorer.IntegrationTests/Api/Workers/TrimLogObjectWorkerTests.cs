using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    [SuppressMessage("ReSharper", "xUnit1004")]
    public class TrimLogObjectWorkerTests
    {
        private readonly TrimLogObjectWorker worker;

        public TrimLogObjectWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new TrimLogObjectWorker(witsmlClientProvider);
        }

        [Fact(Skip="Should only be run manually")]
        public async Task TrimStartOfLogObject()
        {
            var wellUid = "W-5232880";
            var wellboreUid = "B-5232880";
            var logUid = "a58adfe9-6132-446d-bff2-631fa6885244";
            var job = new TrimLogDataJob
            {
                LogObject = new LogReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    LogUid = logUid
                },
                StartIndex = "200",
                EndIndex = "2000"
            };

            await worker.Execute(job);
        }
    }
}
