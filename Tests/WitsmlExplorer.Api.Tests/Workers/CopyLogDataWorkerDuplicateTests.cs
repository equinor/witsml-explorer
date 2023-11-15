using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CopyLogDataWorkerDuplicateTests
    {
        private readonly CopyLogDataWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlTargetClient;
        private readonly Mock<IWitsmlClient> _witsmlSourceClient;
        private readonly Mock<IDocumentRepository<Server, Guid>> _documentRepository;
        private readonly Uri _targetUri = new("https://target");
        private readonly Uri _sourceUri = new("https://source");

        public CopyLogDataWorkerDuplicateTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlTargetClient = new Mock<IWitsmlClient>();
            _witsmlSourceClient = new Mock<IWitsmlClient>();
            _witsmlTargetClient.Setup(client => client.GetServerHostname()).Returns(_targetUri);
            _witsmlSourceClient.Setup(client => client.GetServerHostname()).Returns(_sourceUri);
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlTargetClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlSourceClient.Object);
            _documentRepository = new();
            _documentRepository.Setup(client => client.GetDocumentsAsync())
            .ReturnsAsync(new List<Server>(){
                            new(){
                                Url = _targetUri,
                                DepthLogDecimals = 1
                            },
                            new(){
                                Url = _sourceUri,
                                DepthLogDecimals = 2
                            }
            }.AsCollection());
            Mock<ILogger<CopyLogDataJob>> logger = new();
            _worker = new CopyLogDataWorker(witsmlClientProvider.Object, logger.Object, _documentRepository.Object);
        }

        [Fact]
        public async Task Execute_FewerTargetDecimals_DuplicatesCollated()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.15, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlSourceClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlTargetClient);
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.11",
            new() { new() { Data = "123.11,1," }, new() { Data = "123.12,,2" }, new() { Data = "123.13,3," }, new() { Data = "123.15,4," } });
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, (logs) => logs.Logs.First().StartIndex?.Value == "123.15",
            new() { new() { Data = "123.15,4," } });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlTargetClient);

            await _worker.Execute(job);

            Assert.Equal("123.1,1,2", updatedLogs.First().Logs.First().LogData.Data[0].Data);
            Assert.Equal("123.2,4,", updatedLogs.First().Logs.First().LogData.Data[1].Data);
        }

        [Fact]
        public async Task Execute_FewerTargetDecimalsNewRowSplitBetweenBatches_NoSourceRowsOmitted()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.18, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlSourceClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlTargetClient);
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, logs => logs.Logs.First().StartIndex?.Value == "123.11",
            new() { new() { Data = "123.11,1," }, new() { Data = "123.16,,2" } });
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, logs => logs.Logs.First().StartIndex?.Value == "123.16",
            new() { new() { Data = "123.16,,2" }, new() { Data = "123.17,3," }, new() { Data = "123.18,,4" } });
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, logs => logs.Logs.First().StartIndex?.Value == "123.18", new() { new() { Data = "123.18,,4" } });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlTargetClient);

            await _worker.Execute(job);

            Assert.Equal("123.1,1,", updatedLogs.First().Logs.First().LogData.Data[0].Data);
            Assert.Equal("123.2,3,2", updatedLogs[1].Logs.First().LogData.Data[0].Data);
        }

        [Fact]
        public async Task Execute_FewerTargetDecimalsOneDepthRow_CopiedCorrectly()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.11, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlSourceClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlTargetClient);
            LogUtils.SetupGetDepthIndexed(_witsmlSourceClient, (logs) => true, new() { new() { Data = "123.11,1,2" }, });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlTargetClient);

            await _worker.Execute(job);

            Assert.Equal("123.1,1,2", updatedLogs.First().Logs.First().LogData.Data[0].Data);
        }

    }
}
