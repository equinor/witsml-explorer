using System;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class RenameMnemonicWorkerTests
    {
        private readonly RenameMnemonicWorker _worker;
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string LogUid = "logUid";

        public RenameMnemonicWorkerTests()
        {
            var witsmlClient = new Mock<IWitsmlClient>();
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(witsmlClient.Object);
            var loggerFactory = (ILoggerFactory)new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            var logger = loggerFactory.CreateLogger<RenameMnemonicJob>();
            _worker = new RenameMnemonicWorker(logger, witsmlClientProvider.Object);
        }

        [Fact]
        public async void MnemonicEmpty_RenameMnemonic_ShouldThrowException()
        {
            var job = CreateJobTemplate() with
            {
                Mnemonic = "",
                NewMnemonic = "Felgen"
            };

            Task ExecuteWorker() => _worker.Execute(job);

            await Assert.ThrowsAsync<InvalidOperationException>(ExecuteWorker);
        }

        [Fact]
        public async void NewMnemonicNull_RenameMnemonic_ShouldThrowException()
        {
            var job = CreateJobTemplate() with
            {
                Mnemonic = "Reodor",
                NewMnemonic = null
            };

            Task ExecuteWorker() => _worker.Execute(job);

            await Assert.ThrowsAsync<InvalidOperationException>(ExecuteWorker);
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
