using System.Diagnostics.CodeAnalysis;

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
    public class RenameMnemonicWorkerTests
    {
        private readonly RenameMnemonicWorker _worker;
        private const string WellUid = "";
        private const string WellboreUid = "";
        private const string LogUid = "";

        public RenameMnemonicWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<RenameMnemonicJob>();
            _worker = new RenameMnemonicWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async void ValidInput_RenameMnemonic_ShouldReturnSuccess()
        {
            var job = CreateJobTemplate() with
            {
                Mnemonic = "",
                NewMnemonic = ""
            };

            var (result, _) = await _worker.Execute(job);

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
