using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
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

        public CopyLogDataWorkerTests()
        {
            Mock<IWitsmlClientProvider> witsmlClientProvider = new();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlClient.Object);
            Mock<ILogger<CopyLogDataJob>> logger = new();
            Mock<IDocumentRepository<Server, Guid>> documentRepository = new();
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
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() => LogUtils.GetSourceLogData(query.Logs.First().StartDateTimeIndex, query.Logs.First().EndDateTimeIndex));

            await _worker.Execute(job);

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME]), updatedLogs.First().Logs.First().LogData.MnemonicList);
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

            Assert.Equal(string.Join(",", SourceMnemonics[WitsmlLog.WITSML_INDEX_TYPE_MD]), updatedLogs.First().Logs.First().LogData.MnemonicList);
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
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex, job.Source.ComponentUids);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(",");
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
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
                .ReturnsAsync(() =>
                {
                    double startIndex = double.Parse(query.Logs.First().StartIndex.Value);
                    double endIndex = double.Parse(query.Logs.First().EndIndex.Value);
                    return LogUtils.GetSourceLogData(startIndex, endIndex);
                });
            List<WitsmlLogs> updatedLogs = LogUtils.SetupUpdateInStoreAsync(_witsmlClient);

            await _worker.Execute(job);

            Assert.NotNull(query);
            string[] queriedMnemonics = query.Logs.First().LogData.MnemonicList.Split(",");
            string[] copiedMnemonics = updatedLogs.Last().Logs.First().LogData.MnemonicList.Split(",");
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
            _witsmlClient.Setup(client => client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), new OptionsIn(ReturnElements.DataOnly, null, null)))
                .Callback<WitsmlLogs, OptionsIn>((logs, _) => query = logs)
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
    }
}
