using System;
using System.Collections.Generic;
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
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class TestLog
    {
        public string IndexType { get; set; }
        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
        public List<(string, string)> LogCurveInfo { get; set; }
        public List<string> Data { get; set; }
    }

    public class CompareLogDataWorkerTests
    {
        private readonly string _sourceWellUid = "sourcewelluid";
        private readonly string _sourceWellboreUid = "sourcewellboreuid";
        private readonly string _sourceLogUid = "sourceLogUid";
        private readonly string _targetWellUid = "targetwelluid";
        private readonly string _targetWellboreUid = "targetwellboreuid";
        private readonly string _targetLogUid = "targetloguid";
        private readonly Uri _targetUri = new("https://target");
        private readonly Uri _sourceUri = new("https://source");
        private Mock<IDocumentRepository<Server, Guid>> _documentRepository;
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider;
        private readonly Mock<IWitsmlClient> _witsmlSourceClient;
        private readonly Mock<IWitsmlClient> _witsmlTargetClient;
        private Mock<ILogger<CompareLogDataJob>> _logger;
        private CompareLogDataWorker _worker;

        public CompareLogDataWorkerTests()
        {
            _witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlSourceClient = new Mock<IWitsmlClient>();
            _witsmlTargetClient = new Mock<IWitsmlClient>();
            _witsmlSourceClient.Setup(client => client.GetServerHostname()).Returns(_sourceUri);
            _witsmlTargetClient.Setup(client => client.GetServerHostname()).Returns(_targetUri);
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlSourceClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlTargetClient.Object);
        }

        [Fact]
        public async Task CompareLogDataWorker_EqualDepthLogs_ReturnsZeroReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 0;

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);
        }

        [Fact]
        public async Task CompareLogDataWorker_EqualTimeLogs_ReturnsZeroReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 0;

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);
        }

        [Fact]
        public async Task CompareLogDataWorker_MismatchInSharedIndexDepthLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "2",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0", "2,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "2",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,99", "2,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("1", "Curve1", "0", "99");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogDataWorker_MismatchInSharedIndexTimeLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:12:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0", "2023-09-28T08:12:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:12:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,99", "2023-09-28T08:12:00Z,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:11:00Z", "Curve1", "0", "99");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_DifferentNumberOfMnemonicsDepthLogs_ReturnsOnlySharedMnemonicsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1"), ("Curve2", "Unit2") },
                Data = new() { "0,1,0", "1,0,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("0", "Curve1", "0", "1");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_DifferentNumberOfMnemonicsTimeLogs_ReturnsOnlySharedMnemonicsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1"), ("Curve2", "Unit2") },
                Data = new() { "2023-09-28T08:10:00Z,1,0", "2023-09-28T08:11:00Z,0,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:10:00Z", "Curve1", "0", "1");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_DifferentIndexRangeDepthLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "2",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0", "2,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2", "Curve1", null, "0");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_DifferentIndexRangeTimeLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:12:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0", "2023-09-28T08:12:00Z,0" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:12:00Z", "Curve1", null, "0");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogDataWorker_MissingDataDepthLogs_ReturnsZeroReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,0", "1,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0",
                EndIndex = "1",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0,", "1," }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 2;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("0", "Curve1", "0", null);
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("1", "Curve1", "0", null);

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_MissingDataTimeLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,", "2023-09-28T08:11:00Z," }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();

            int expectedNumberOfMismatches = 2;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:10:00Z", "Curve1", "0", null);
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("2023-09-28T08:11:00Z", "Curve1", "0", null);

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_UnequalServerDecimalsDepthLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(2, 3);

            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;

            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.03",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.01,11", "0.02,22", "0.03,33" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.03",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.012,11", "0.016,99", "0.028,33" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataUnequalServerDecimalsItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataUnequalServerDecimalsItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            CompareLogDataUnequalServerDecimalsItem expectedMismatchItem1 = CreateCompareLogDataUnequalServerDecimalsItem("Curve1", "0.02", "0.016", "22", "99");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceIndex, resultReportItems[0].SourceIndex);
            Assert.Equal(expectedMismatchItem1.TargetIndex, resultReportItems[0].TargetIndex);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_UnequalServerDecimalsDepthLogsServerDecimalsFlipped_ReturnsMismatchedReportItems()
        {
            SetupWorker(3, 2);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.03",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.012,11", "0.016,99", "0.028,33" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.03",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.01,11", "0.02,22", "0.03,33" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataUnequalServerDecimalsItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataUnequalServerDecimalsItem)x).ToList();

            int expectedNumberOfMismatches = 1;
            List<WitsmlData> someData = GetLogData(targetLog.Data);

            CompareLogDataUnequalServerDecimalsItem expectedMismatchItem1 = CreateCompareLogDataUnequalServerDecimalsItem("Curve1", "0.016", "0.02", "99", "22");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceIndex, resultReportItems[0].SourceIndex);
            Assert.Equal(expectedMismatchItem1.TargetIndex, resultReportItems[0].TargetIndex);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_UnequalServerDecimalsExcludeIndexDuplicatesDepthLogs_ReturnsZeroMismatchedReportItems()
        {
            SetupWorker(2, 3);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.01",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.01,11" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.011",
                EndIndex = "0.0013",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.011,11", "0.012,99", "0.013,11" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataUnequalServerDecimalsItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataUnequalServerDecimalsItem)x).ToList();

            int expectedNumberOfMismatches = 0;

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);
        }

        [Fact]
        public async Task CompareLogData_UnequalServerDecimalsIndexIncludeDuplicatesDepthLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(2, 3);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.01",
                EndIndex = "0.01",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.01,11" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.011",
                EndIndex = "0.0013",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.011,11", "0.012,99", "0.013,11" }
            };

            var job = SetupTest(sourceLog, targetLog, includeIndexDuplicates: true);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataUnequalServerDecimalsIndexDuplicateItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataUnequalServerDecimalsIndexDuplicateItem)x).ToList();

            int expectedNumberOfMismatches = 3;
            CompareLogDataUnequalServerDecimalsIndexDuplicateItem expectedMismatchItem1 = CreateCompareLogDataUnequalServerDecimalsIndexDuplicateItem("Curve1", "0.01", "0.011", "11", "11", true);
            CompareLogDataUnequalServerDecimalsIndexDuplicateItem expectedMismatchItem2 = CreateCompareLogDataUnequalServerDecimalsIndexDuplicateItem("Curve1", "0.01", "0.012", "11", "99", true);
            CompareLogDataUnequalServerDecimalsIndexDuplicateItem expectedMismatchItem3 = CreateCompareLogDataUnequalServerDecimalsIndexDuplicateItem("Curve1", "0.01", "0.013", "11", "11", true);

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceIndex, resultReportItems[0].SourceIndex);
            Assert.Equal(expectedMismatchItem1.TargetIndex, resultReportItems[0].TargetIndex);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
            Assert.Equal(expectedMismatchItem1.IndexDuplicate, resultReportItems[0].IndexDuplicate);

            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceIndex, resultReportItems[1].SourceIndex);
            Assert.Equal(expectedMismatchItem2.TargetIndex, resultReportItems[1].TargetIndex);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);
            Assert.Equal(expectedMismatchItem2.IndexDuplicate, resultReportItems[1].IndexDuplicate);

            Assert.Equal(expectedMismatchItem3.Mnemonic, resultReportItems[2].Mnemonic);
            Assert.Equal(expectedMismatchItem3.SourceIndex, resultReportItems[2].SourceIndex);
            Assert.Equal(expectedMismatchItem3.TargetIndex, resultReportItems[2].TargetIndex);
            Assert.Equal(expectedMismatchItem3.SourceValue, resultReportItems[2].SourceValue);
            Assert.Equal(expectedMismatchItem3.TargetValue, resultReportItems[2].TargetValue);
            Assert.Equal(expectedMismatchItem3.IndexDuplicate, resultReportItems[2].IndexDuplicate);
        }

        [Fact]
        public async Task CompareLogData_UnequalServerDecimalsUnsharedIndexesDepthLogs_ReturnsMismatchedReportItems()
        {
            SetupWorker(2, 3);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.00",
                EndIndex = "0.02",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.00,00", "0.01,11", "0.02,22" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "0.010",
                EndIndex = "0.030",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "0.010,11", "0.020,22", "0.030,33" }
            };

            var job = SetupTest(sourceLog, targetLog);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataUnequalServerDecimalsItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataUnequalServerDecimalsItem)x).ToList();

            int expectedNumberOfMismatches = 2;
            CompareLogDataUnequalServerDecimalsItem expectedMismatchItem1 = CreateCompareLogDataUnequalServerDecimalsItem("Curve1", "0.00", null, "00", null);
            CompareLogDataUnequalServerDecimalsItem expectedMismatchItem2 = CreateCompareLogDataUnequalServerDecimalsItem("Curve1", null, "0.030", null, "33");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceIndex, resultReportItems[0].SourceIndex);
            Assert.Equal(expectedMismatchItem1.TargetIndex, resultReportItems[0].TargetIndex);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceIndex, resultReportItems[1].SourceIndex);
            Assert.Equal(expectedMismatchItem2.TargetIndex, resultReportItems[1].TargetIndex);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_DepthSharedIndexInterval_ReturnsMismatchInSharedIntervalOnly()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "1",
                EndIndex = "3",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "1,11", "2,21", "3,31" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2",
                EndIndex = "4",
                LogCurveInfo = new() { ("IndexCurve", CommonConstants.Unit.Meter), ("Curve1", "Unit1") },
                Data = new() { "2,22", "3,32", "4,42" }
            };

            var job = SetupTest(sourceLog, targetLog, false, false, indexType);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            Console.WriteLine(resultReportItems);


            int expectedNumberOfMismatches = 2;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2", "Curve1", "21", "22");
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("3", "Curve1", "31", "32");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_TimeSharedIndexInterval_ReturnsMismatchInSharedIntervalOnly()
        {
            SetupWorker(0, 0);
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            TestLog sourceLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:10:00Z",
                EndIndex = "2023-09-28T08:11:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:10:00Z,0", "2023-09-28T08:11:00Z,0" }
            };

            TestLog targetLog = new TestLog()
            {
                IndexType = indexType,
                StartIndex = "2023-09-28T08:11:00Z",
                EndIndex = "2023-09-28T08:12:00Z",
                LogCurveInfo = new() { ("IndexCurve", "DateTime"), ("Curve1", "Unit1") },
                Data = new() { "2023-09-28T08:11:00Z,1", "2023-09-28T08:12:00Z,1" }
            };

            var job = SetupTest(sourceLog, targetLog, false, false, indexType);
            var (workerResult, refreshAction) = await _worker.Execute(job);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            Console.WriteLine(resultReportItems);


            int expectedNumberOfMismatches = 1;
            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:11:00Z", "Curve1", "0", "1");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        private CompareLogDataJob SetupTest(TestLog sourceLog, TestLog targetLog, bool includeIndexDuplicates = false, bool compareAllIndexes = true, string indexType = null)
        {
            CompareLogDataJob job = CreateCompareLogDataJob(includeIndexDuplicates, compareAllIndexes);
            WitsmlLogs sourceLogHeader = CreateSampleLogHeaders(_sourceWellUid, _sourceWellboreUid, _sourceLogUid, sourceLog);
            WitsmlLogs targetLogHeader = CreateSampleLogHeaders(_targetWellUid, _targetWellboreUid, _targetLogUid, targetLog);
            WitsmlLogs sourceLogData = CreateSampleLogData(_sourceWellUid, _sourceWellboreUid, _sourceLogUid, sourceLog);
            WitsmlLogs targetLogData = CreateSampleLogData(_targetWellUid, _targetWellboreUid, _targetLogUid, targetLog);
            SetupClient(_witsmlSourceClient, sourceLogHeader, sourceLogData, compareAllIndexes, indexType);
            SetupClient(_witsmlTargetClient, targetLogHeader, targetLogData, compareAllIndexes, indexType);
            return job;
        }


        private void SetupClient(Mock<IWitsmlClient> witsmlClient, WitsmlLogs logHeaders, WitsmlLogs logData, bool compareAllIndexes, string indexType)
        {
            int getDataCount = 0;
            // Mock fetching log
            witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns((WitsmlLogs logs, OptionsIn options, CancellationToken? _) =>
            {
                // Mock fetching the header
                if (options.ReturnElements == ReturnElements.HeaderOnly)
                {
                    return Task.FromResult(logHeaders);
                }
                // Mock feching log data for each log
                else if (options.ReturnElements == ReturnElements.DataOnly)
                {
                    getDataCount++; // LogDataReader is used multiple times, so simulate end of data for every 2nd call.
                    if (getDataCount % 2 == 0) return Task.FromResult(new WitsmlLogs());
                    string uid = logs.Logs.First().Uid;
                    WitsmlLog log = logData.Logs.Find(l => l.Uid == uid);
                    IEnumerable<string> data = log.LogData.Data.Select(d => d.Data);
                    string mnemonic = logs.Logs.FirstOrDefault()?.LogData.MnemonicList.Split(CommonConstants.DataSeparator)[1];
                    int mnemonicIndex = log.LogData.MnemonicList.Split(CommonConstants.DataSeparator).ToList().FindIndex(m => m == mnemonic);
                    List<string> dataForCurve = new List<string>();
                    foreach (string dataRow in data)
                    {
                        string index = dataRow.Split(CommonConstants.DataSeparator)[0];
                        string mnemonicData = dataRow.Split(CommonConstants.DataSeparator)[mnemonicIndex];
                        if (!string.IsNullOrEmpty(mnemonicData))
                        {
                            if (!compareAllIndexes && indexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
                            {
                                double currentIndexValue = StringHelpers.ToDouble(index);
                                double startIndexValue = StringHelpers.ToDouble(logs.Logs.First().StartIndex.Value);
                                double endIndexValue = StringHelpers.ToDouble(logs.Logs.First().EndIndex.Value);
                                if (currentIndexValue >= startIndexValue && currentIndexValue <= endIndexValue)
                                {
                                    dataForCurve.Add($"{index},{mnemonicData}");
                                }
                            }
                            else if (!compareAllIndexes && indexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
                            {
                                var currentDateTimeIndex = StringHelpers.ToDateTime(index);
                                var startDateTimeIndex = StringHelpers.ToDateTime(logs.Logs.First().StartDateTimeIndex);
                                var endDateTimeIndex = StringHelpers.ToDateTime(logs.Logs.First().EndDateTimeIndex);
                                if (currentDateTimeIndex >= startDateTimeIndex && currentDateTimeIndex <= endDateTimeIndex)
                                {
                                    dataForCurve.Add($"{index},{mnemonicData}");
                                }
                            }
                            else
                            {
                                dataForCurve.Add($"{index},{mnemonicData}");
                            }
                        }
                    }
                    WitsmlLogs newLogData = new()
                    {
                        Logs = new WitsmlLog()
                        {
                            Uid = log.Uid,
                            UidWell = log.UidWell,
                            UidWellbore = log.UidWellbore,
                            LogData = new WitsmlLogData()
                            {
                                MnemonicList = logs.Logs.First().LogData.MnemonicList,
                                UnitList = logs.Logs.First().LogData.UnitList,
                                Data = dataForCurve.Select(d => new WitsmlData() { Data = d }).ToList()
                            }
                        }.AsItemInList()
                    };
                    return Task.FromResult(newLogData);
                }
                throw new ArgumentException("The sent request has not been mocked.");
            });
        }

        private void SetupWorker(int sourceDepthLogDecimals, int targetDepthLogDecimals)
        {
            _documentRepository = new();
            _documentRepository.Setup(client => client.GetDocumentsAsync())
            .ReturnsAsync(new List<Server>(){
                            new(){
                                Url = _targetUri,
                                DepthLogDecimals = targetDepthLogDecimals
                            },
                            new(){
                                Url = _sourceUri,
                                DepthLogDecimals = sourceDepthLogDecimals
                            }
            });
            _logger = new();
            _worker = new CompareLogDataWorker(_logger.Object, _witsmlClientProvider.Object, _documentRepository.Object);
        }

        private WitsmlLogs CreateSampleLogData(string wellUid, string wellboreUid, string logUid, TestLog log)
        {
            string mnemonicsList = string.Empty;
            string unitList = string.Empty;
            foreach ((string, string) mnemonic in log.LogCurveInfo)
            {
                mnemonicsList += mnemonic.Item1 + CommonConstants.DataSeparator;
                unitList += mnemonic.Item2 + CommonConstants.DataSeparator;
            }

            // Remove last "," in mnemonic list and unit list
            mnemonicsList = mnemonicsList.Remove(mnemonicsList.Length - 1, 1);
            unitList = unitList.Remove(unitList.Length - 1, 1);

            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    LogData = new()
                    {
                        MnemonicList = mnemonicsList,
                        UnitList = unitList,
                        Data = GetLogData(log.Data),
                    }
                }.AsItemInList()
            };
        }

        private List<WitsmlData> GetLogData(List<string> logData)
        {
            return logData.Select((data) => new WitsmlData() { Data = data }).ToList();
        }

        private WitsmlLogs CreateSampleLogHeaders(string wellUid, string wellboreUid, string logUid, TestLog log)
        {
            var isDepthLog = log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Direction = WitsmlLog.WITSML_DIRECTION_INCREASING,
                    IndexType = log.IndexType,
                    StartIndex = isDepthLog ? new WitsmlIndex() { Value = log.StartIndex, Uom = CommonConstants.Unit.Meter } : null,
                    StartDateTimeIndex = isDepthLog ? null : log.StartIndex,
                    EndIndex = isDepthLog ? new WitsmlIndex() { Value = log.EndIndex, Uom = CommonConstants.Unit.Meter } : null,
                    EndDateTimeIndex = isDepthLog ? null : log.EndIndex,
                    IndexCurve = new WitsmlIndexCurve() { Value = "IndexCurve" },
                    LogCurveInfo = GetLogCurveInfo(log.IndexType, log.StartIndex, log.EndIndex, log.LogCurveInfo)
                }.AsItemInList(),
            };
        }

        private List<WitsmlLogCurveInfo> GetLogCurveInfo(string indexType, string startIndex, string endIndex, List<(string, string)> logCurveInfo)
        {
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            var minIndex = isDepthLog ? new WitsmlIndex() { Value = startIndex, Uom = CommonConstants.Unit.Meter } : null;
            var minDateTimeIndex = isDepthLog ? null : startIndex;
            var maxIndex = isDepthLog ? new WitsmlIndex() { Value = endIndex, Uom = CommonConstants.Unit.Meter } : null;
            var maxDateTimeIndex = isDepthLog ? null : endIndex;
            var curveInfo = logCurveInfo.Select(mnemonic => new WitsmlLogCurveInfo
            {
                Mnemonic = mnemonic.Item1,
                Unit = mnemonic.Item2,
                MinIndex = minIndex,
                MinDateTimeIndex = minDateTimeIndex,
                MaxIndex = maxIndex,
                MaxDateTimeIndex = maxDateTimeIndex
            }).ToList();

            return curveInfo;
        }

        private CompareLogDataItem CreateCompareLogDataItem(string index, string mnemonic, string sourceValue, string targetValue)
        {
            return new CompareLogDataItem()
            {
                Index = index,
                Mnemonic = mnemonic,
                SourceValue = sourceValue,
                TargetValue = targetValue,
            };
        }

        private CompareLogDataUnequalServerDecimalsItem CreateCompareLogDataUnequalServerDecimalsItem(string mnemonic, string sourceIndex, string targetIndex, string sourceValue, string targetValue)
        {
            return new CompareLogDataUnequalServerDecimalsItem
            {
                Mnemonic = mnemonic,
                SourceIndex = sourceIndex,
                TargetIndex = targetIndex,
                SourceValue = sourceValue,
                TargetValue = targetValue,
            };
        }

        private CompareLogDataUnequalServerDecimalsIndexDuplicateItem CreateCompareLogDataUnequalServerDecimalsIndexDuplicateItem(string mnemonic, string sourceIndex, string targetIndex, string sourceValue, string targetValue, bool isDuplicate)
        {
            return new CompareLogDataUnequalServerDecimalsIndexDuplicateItem
            {
                Mnemonic = mnemonic,
                SourceIndex = sourceIndex,
                TargetIndex = targetIndex,
                SourceValue = sourceValue,
                TargetValue = targetValue,
                IndexDuplicate = isDuplicate ? "X" : null
            };
        }

        private CompareLogDataJob CreateCompareLogDataJob(bool includeIndexDuplicates = false, bool compareAllIndexes = true)
        {
            return new CompareLogDataJob
            {
                SourceLog = new ObjectReference
                {
                    WellUid = _sourceWellUid,
                    WellboreUid = _sourceWellboreUid,
                    WellName = _sourceWellUid,
                    WellboreName = _sourceWellboreUid,
                    Uid = _sourceLogUid,
                    Name = _sourceLogUid
                },
                TargetLog = new ObjectReference
                {
                    WellUid = _targetWellUid,
                    WellboreUid = _targetWellboreUid,
                    WellName = _targetWellUid,
                    WellboreName = _targetWellboreUid,
                    Uid = _targetLogUid,
                    Name = _targetLogUid
                },
                IncludeIndexDuplicates = includeIndexDuplicates,
                CompareAllIndexes = compareAllIndexes,
                JobInfo = new()
            };
        }
    }
}
