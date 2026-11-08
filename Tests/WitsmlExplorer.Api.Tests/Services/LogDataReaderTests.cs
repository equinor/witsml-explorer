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

        [Fact]
        public async Task GetNextBatch_DuplicateIndexRowsAtEnd_TerminatesWithoutLooping()
        {
            WitsmlLog sourceLog = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.12, "Depth").Logs.First();
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.11",
                new() { new() { Data = "123.11,1," }, new() { Data = "123.12,,2" } });
            // Simulate server returning multiple duplicate rows at index 123.12
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.12",
                new() { new() { Data = "123.12,,2" }, new() { Data = "123.12,,3" }, new() { Data = "123.12,,4" } });

            await using LogDataReader logDataReader = new(_witsmlClient.Object, sourceLog, LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD].ToList(), null);
            WitsmlLogData firstBatch = await logDataReader.GetNextBatch();
            WitsmlLogData secondBatch = await logDataReader.GetNextBatch();
            WitsmlLogData thirdBatch = await logDataReader.GetNextBatch();

            Assert.Equal(2, firstBatch.Data.Count);
            // Second batch should have dropped the first row (the boundary), leaving the remaining 2 duplicate rows
            Assert.Equal(2, secondBatch.Data.Count);
            Assert.Equal("123.12,,3", secondBatch.Data.First().Data);
            Assert.Equal("123.12,,4", secondBatch.Data.Last().Data);
            // Third batch must be null because index did not advance / reached end, breaking any potential infinite loop
            Assert.Null(thirdBatch);
        }
    }
}
