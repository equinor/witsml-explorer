using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using Serilog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.IntegrationTests.Api.Workers
{
    public class ModifyLogCurveInfoWorkerTests
    {
        private readonly ModifyLogCurveInfoWorker _worker;
        private const string WellUid = "";
        private const string WellboreUid = "";
        private const string LogUid = "";

        public ModifyLogCurveInfoWorkerTests()
        {
            IConfiguration configuration = ConfigurationReader.GetConfig();
            WitsmlClientProvider witsmlClientProvider = new(configuration);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<ModifyLogCurveInfoJob> logger = loggerFactory.CreateLogger<ModifyLogCurveInfoJob>();
            _worker = new ModifyLogCurveInfoWorker(logger, witsmlClientProvider);
        }

        [Fact(Skip = "Should only be run manually")]
        public async void ValidInputRenameMnemonicShouldReturnSuccess()
        {
            ModifyLogCurveInfoJob job = CreateJobTemplate() with { LogCurveInfo = new LogCurveInfo() { Mnemonic = "" } };

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);

            Assert.True(result.IsSuccess, result.Reason);
        }

        private static ModifyLogCurveInfoJob CreateJobTemplate()
        {
            return new ModifyLogCurveInfoJob { LogReference = new ObjectReference { WellUid = WellUid, WellboreUid = WellboreUid, Uid = LogUid } };
        }
    }
}
