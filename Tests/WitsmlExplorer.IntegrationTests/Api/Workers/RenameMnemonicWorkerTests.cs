using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class RenameMnemonicWorkerTests
    {
        private readonly RenameMnemonicWorker _worker;
        private const string WellUid = "";
        private const string WellboreUid = "";
        private const string LogUid = "";

        public RenameMnemonicWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<RenameMnemonicJob> logger = loggerFactory.CreateLogger<RenameMnemonicJob>();
            _worker = new RenameMnemonicWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async void ValidInputRenameMnemonicShouldReturnSuccess()
        {
            RenameMnemonicJob job = CreateJobTemplate() with
            {
                Mnemonic = "",
                NewMnemonic = ""
            };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            Assert.True(result.IsSuccess, result.Reason);
        }

        private static RenameMnemonicJob CreateJobTemplate()
        {
            return new RenameMnemonicJob
            {
                LogReference = new LogReference
                {
                    WellUid = WellUid,
                    WellboreUid = WellboreUid,
                    LogUid = LogUid
                }
            };
        }
    }
}
