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
    public class TrimLogObjectWorkerTests
    {
        private readonly TrimLogObjectWorker _worker;

        public TrimLogObjectWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<TrimLogDataJob> logger = loggerFactory.CreateLogger<TrimLogDataJob>();
            _worker = new TrimLogObjectWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async Task TrimStartOfLogObject()
        {
            string wellUid = "W-5232880";
            string wellboreUid = "B-5232880";
            string logUid = "a58adfe9-6132-446d-bff2-631fa6885244";
            TrimLogDataJob job = new()
            {
                LogObject = new ObjectReference
                {
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    Uid = logUid
                },
                StartIndex = "200",
                EndIndex = "2000"
            };

            await _worker.Execute(job);
        }
    }
}
