using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

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
            Mock<ILogger<CopyLogDataJob>> logger = new();
            _worker = new CopyLogDataWorker(witsmlClientProvider.Object, logger.Object, _documentRepository.Object);
        }

        [Fact]
        public async Task Execute_FewerTargetDecimals_DuplicatesCollated()
        {
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
                        });
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.1, 123.16, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlSourceClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlTargetClient);
            SetupGetDepthIndexed(_witsmlSourceClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlTargetClient);

            await _worker.Execute(job);

            Assert.Equal("123.1,1,2", updatedLogs.First().Logs.First().LogData.Data[0].Data);
            Assert.Equal("123.2,4,", updatedLogs.First().Logs.First().LogData.Data[1].Data);
        }

        private static void SetupGetDepthIndexed(Mock<IWitsmlClient> witsmlClient)
        {
            witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null, null)))
                .ReturnsAsync(() => new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        StartIndex = new WitsmlIndex(new DepthIndex(123.11)),
                        EndIndex = new WitsmlIndex(new DepthIndex(123.16)),
                        IndexType = WitsmlLog.WITSML_INDEX_TYPE_MD,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = string.Join(",", LogUtils.SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]),
                            UnitList = "m,m,m",
                            Data = new()
                            {
                                new()
                                {
                                    Data = "123.11,1,"
                                },
                                new()
                                {
                                    Data = "123.12,,2"
                                },
                                new()
                                {
                                    Data = "123.13,3,"
                                },
                                new()
                                {
                                    Data = "123.16,4,"
                                }
                            }
                        }
                    }.AsSingletonList()
                });
        }

    }
}
