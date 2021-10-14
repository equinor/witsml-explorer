using System.Diagnostics.CodeAnalysis;
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
        private readonly RenameMnemonicWorker worker;
        private const string WellUid = "";
        private const string WellboreUid = "";
        private const string LogUid = "";

        public RenameMnemonicWorkerTests()
        {
            var configuration = ConfigurationReader.GetConfig();
            var witsmlClientProvider = new WitsmlClientProvider(configuration);
            worker = new RenameMnemonicWorker(witsmlClientProvider);
        }

        [Fact(Skip="Should only be run manually")]
        public async void ValidInput_RenameMnemonic_ShouldReturnSuccess()
        {
            var job = CreateJobTemplate() with
            {
                Mnemonic = "",
                NewMnemonic = ""
            };

            var (result, _) = await worker.Execute(job);

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
