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
    public class TrimLogObjectWorkerTests
    {
        private readonly TrimLogObjectWorker _worker;

        public TrimLogObjectWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<TrimLogDataJob>();
            _worker = new TrimLogObjectWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
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

            await _worker.Execute(job);
        }
    }
}
