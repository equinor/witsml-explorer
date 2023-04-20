using System.Linq;
using System.Threading.Tasks;

using Moq;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Tests.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Services
{
    public class LogDataReaderTests
    {
        private readonly Mock<IWitsmlClient> _witsmlClient;

        public LogDataReaderTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        }

        [Fact]
        public async Task GetNextBatch_LastBatch_SingleRowDisregarded()
        {
            WitsmlLog sourceLog = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.12, "Depth").Logs.First();
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.11",
            new() { new() { Data = "123.11,1," }, new() { Data = "123.12,,2" } });
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.12",
            new() { new() { Data = "123.12,,2" } });
            await using LogDataReader logDataReader = new(_witsmlClient.Object, sourceLog, LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].ToList(), null);
            WitsmlLogData firstBatch = await logDataReader.GetNextBatch();
            WitsmlLogData lastBatch = await logDataReader.GetNextBatch();

            Assert.Equal("123.11,1,", firstBatch.Data.First().Data);
            Assert.Equal("123.12,,2", firstBatch.Data.Last().Data);
            Assert.Null(lastBatch);
        }
    }
}
