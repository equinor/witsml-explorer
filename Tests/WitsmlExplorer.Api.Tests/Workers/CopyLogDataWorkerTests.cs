using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public class CopyLogDataWorkerTests
    {
        private readonly CopyLogDataWorker _worker;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private static readonly Dictionary<string, string[]> SourceMnemonics = new()
        {
            { WitsmlLog.WITSML_INDEX_TYPE_MD, new[] { "Depth", "DepthBit", "DepthHole" } },
            { WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, new[] { "Time", "DepthBit", "DepthHole" } }
        };
        private const double DepthStart = 1;
        private const double DepthEnd = 5;
        private readonly Uri _targetUri = new("https://target");
        private readonly Uri _sourceUri = new("https://source");

        public CopyLogDataWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            LogUtils.SetUpGetServerCapabilites(_witsmlClient);

            Mock<ILogger<CopyLogDataJob>> logger = new();
            Mock<IDocumentRepository<Server, Guid>> documentRepository = new();
            documentRepository.Setup(client => client.GetDocumentsAsync())
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
            _worker = new CopyLogDataWorker(witsmlClientProvider.Object, logger.Object, documentRepository.Object);
        }

        [Fact]
        public async Task CopyLogData_TimeIndexed()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, _witsmlClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);
            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() => LogUtils.GetSourceLogData(query.Logs.First().StartDateTimeIndex, query.Logs.First().EndDateTimeIndex));

            await _worker.Execute(job);

            Assert.Equal(string.Join(CommonConstants.DataSeparator, SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupGetDepthIndexed(_witsmlClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.Equal(string.Join(CommonConstants.DataSeparator, SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_Decreasing()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();

            WitsmlLogs sourceLogs = LogUtils.GetSourceLogsDecreasing(WitsmlLog.WITSML_INDEX_TYPE_MD, 200, 196, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);

            LogUtils.SetupGetDepthIndexedDecreasing(_witsmlClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.Equal(string.Join(CommonConstants.DataSeparator, SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]), updatedLogs.First().Logs.First().LogData.MnemonicList);
            Assert.Equal(5, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_SelectedMnemonics()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            job.Source.ComponentUids = new[] { "Depth", "DepthBit" };

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>(optionsIn => optionsIn.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex, job.Source.ComponentUids);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(CommonConstants.DataSeparator);
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(CommonConstants.DataSeparator);
            Assert.Equal(job.Source.ComponentUids, queriedMnemonics);
            Assert.Equal(job.Source.ComponentUids, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AddsIndexMnemonicIfNotIncludedInJob()
        {
            string indexMnemonic = "Depth";
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            job.Source.ComponentUids = new[] { "DepthBit" };

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);

            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(CommonConstants.DataSeparator);
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(CommonConstants.DataSeparator);
            Assert.Contains(indexMnemonic, queriedMnemonics);
            Assert.Contains(indexMnemonic, copiedMnemonics);
        }

        [Fact]
        public async Task CopyLogData_Returns_Error_IfMismatchedIndexTypes()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, _witsmlClient);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.False(result.IsSuccess);
            Assert.Equal("sourceLog and targetLog has mismatching index types", result.Reason);
        }

        [Fact]
        public async Task CopyLogData_DepthIndexed_AllowIndexCurveNamesThatOnlyDifferInCasing()
        {
            string sourceIndexCurve = "DEPTH";
            string targetIndexCurve = "Depth";
            string[] mnemonics = new[] { sourceIndexCurve, "DepthBit", "DepthHole" };
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            job.Source.ComponentUids = mnemonics;
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd, sourceIndexCurve);
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);

            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex, job.Source.ComponentUids);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.True(result.IsSuccess);
            Assert.Equal(3, updatedLogs.First().Logs.First().LogCurveInfo.Count);
            Assert.Equal(targetIndexCurve, updatedLogs.First().Logs.First().LogCurveInfo.First().Mnemonic);
        }

        [Fact]
        public async Task Execute_DifferentIndexMnemonics_CopyWithTargetIndex()
        {
            string sourceIndexCurve = "DEPTH";
            string targetIndexCurve = "Dep";
            string[] mnemonics = new[] { sourceIndexCurve, "DepthBit", "DepthHole" };
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            job.Source.ComponentUids = mnemonics;
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, DepthStart, DepthEnd, sourceIndexCurve);
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            WitsmlLogs targetLog = LogUtils.GetTargetLogs(WitsmlLog.WITSML_INDEX_TYPE_MD);
            targetLog.Logs.First().IndexCurve = new() { Value = targetIndexCurve };
            targetLog.Logs.First().LogCurveInfo.First().Mnemonic = targetIndexCurve;
            targetLog.Logs.First().LogCurveInfo.First().Uid = targetIndexCurve;
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, targetLog);

            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex, mnemonics);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            (WorkerResult result, RefreshAction _) = await _worker.Execute(job);
            Assert.True(result.IsSuccess);
            Assert.Equal(3, updatedLogs.First().Logs.First().LogCurveInfo.Count);
            Assert.StartsWith(targetIndexCurve, updatedLogs[1].Logs.First().LogData.MnemonicList);
        }

        [Fact]
        public async Task Execute_OneDepthRow_CopiedCorrectly()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.11, 123.11, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            LogUtils.SetupGetDepthIndexed(_witsmlClient, (logs) => true, new() { new() { Data = "123.11,1,2" }, });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.Equal("123.11,1,2", updatedLogs.First().Logs.First().LogData.Data[0].Data);
        }

        [Fact]
        public async Task Execute_DepthRange_CopiedCorrectly()
        {
            string startIndex = "123.12";
            string endIndex = "123.18";
            CopyLogDataJob job = LogUtils.CreateJobTemplate(startIndex, endIndex);
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogs(WitsmlLog.WITSML_INDEX_TYPE_MD, 123.10, 123.20, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            string row1 = "123.12,1,2";
            string row2 = "123.15,3,4";
            string row3 = "123.18,5,6";
            LogUtils.SetupGetDepthIndexed(_witsmlClient,
            (logs) => logs.Logs.First().StartIndex?.Value == startIndex && logs.Logs.First().EndIndex?.Value == endIndex,
            new() { new() { Data = row1 }, new() { Data = row2 }, new() { Data = row3 } });
            LogUtils.SetupGetDepthIndexed(_witsmlClient,
            (logs) => logs.Logs.First().StartIndex?.Value == endIndex,
            new() { new() { Data = row3 } });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.Equal(row1, updatedLogs.First().Logs.First().LogData.Data[0].Data);
            Assert.Equal(row2, updatedLogs.First().Logs.First().LogData.Data[1].Data);
            Assert.Equal(row3, updatedLogs.First().Logs.First().LogData.Data[2].Data);
        }

        [Fact]
        public async Task Execute_TimeRange_CopiedCorrectly()
        {
            string startIndex = "2019-11-01T21:02:00.000Z";
            string endIndex = "2019-11-01T21:04:00.000Z";
            CopyLogDataJob job = LogUtils.CreateJobTemplate(startIndex, endIndex);

            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, _witsmlClient);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, _witsmlClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);
            WitsmlLogs query = null;
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.Is<OptionsIn>((ops) => ops.ReturnElements == ReturnElements.DataOnly), null))
                .Callback<WitsmlLogs, OptionsIn, CancellationToken?>((logs, _, _) => query = logs)
                .ReturnsAsync(() => LogUtils.GetSourceLogData(query.Logs.First().StartDateTimeIndex, query.Logs.First().EndDateTimeIndex));

            await _worker.Execute(job);

            Assert.Equal(3, updatedLogs.First().Logs.First().LogData.Data.Count);
        }

        [Fact]
        public async Task Execute_NoRows_NoCopies()
        {
            CopyLogDataJob job = LogUtils.CreateJobTemplate();
            WitsmlLogs sourceLogs = LogUtils.GetSourceLogsEmpty(WitsmlLog.WITSML_INDEX_TYPE_MD, "Depth");
            LogUtils.SetupSourceLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient, sourceLogs);
            LogUtils.SetupTargetLog(WitsmlLog.WITSML_INDEX_TYPE_MD, _witsmlClient);
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            (WorkerResult, RefreshAction) result = await _worker.Execute(job);

            Assert.True(result.Item1.IsSuccess);
            Assert.Empty(updatedLogs);
        }
    }
}
