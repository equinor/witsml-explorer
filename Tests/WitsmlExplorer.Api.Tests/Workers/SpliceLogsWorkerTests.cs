using System;
using System.Collections.Generic;
using System.Globalization;
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
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class SpliceLogsWorkerTests
    {
        private readonly string _wellUid = "wellUid";
        private readonly string _wellboreUid = "wellboreUid";
        private readonly string _newLogName = "newLogName";
        private readonly string _newLogUid = "newLogUid";
        private readonly DateTime _baseDateTime = DateTime.Parse("2023-09-28T08:10:00Z", CultureInfo.InvariantCulture);
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider;
        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly Mock<ILogger<SpliceLogsJob>> _logger;
        private readonly SpliceLogsWorker _worker;

        public SpliceLogsWorkerTests()
        {
            _witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            _logger = new Mock<ILogger<SpliceLogsJob>>();
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            _worker = new SpliceLogsWorker(_logger.Object, _witsmlClientProvider.Object);
            LogUtils.SetUpGetServerCapabilites(_witsmlClient);
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_SplicedLog_HasCorrectHeader(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 10, 10 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, log => capturedLogHeader = log, capturedLogData.Add);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLog> newLogDataHeaders = capturedLogData.Select(data => data.Logs.First()).ToList();

            Assert.True(workerResult.IsSuccess);
            Assert.NotNull(refreshAction);

            // Verify that the captured new log has the correct header
            Assert.NotNull(capturedLogHeader);
            Assert.Single(capturedLogHeader.Logs);
            Assert.Equal(_newLogUid, newLogHeader.Uid);
            Assert.Equal(_newLogName, newLogHeader.Name);
            Assert.Equal(_wellUid, newLogHeader.UidWell);
            Assert.Equal(_wellboreUid, newLogHeader.UidWellbore);
            Assert.Equal(indexType, newLogHeader.IndexType);

            // Verify that the captured log datas have the correct header
            Assert.All(newLogDataHeaders, newLogDataHeader =>
                {
                    Assert.Equal(_newLogUid, newLogDataHeader.Uid);
                    Assert.Equal(_wellUid, newLogDataHeader.UidWell);
                    Assert.Equal(_wellboreUid, newLogDataHeader.UidWellbore);
                }
            );
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_OnlyOverlap_KeepsFirst(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 10, 10 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var expectedMnemonics = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> expectedData = logData.Logs.First().LogData.Data.Select(d => d.Data);
            IEnumerable<string> newLogDataData = newLogData.Data.Select(d => d.Data);

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(expectedData, newLogDataData);
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_NoOverlap_KeepsBoth(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 5 }; // start indexes for each log
            int[] endIndexNum = { 4, 9 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var expectedMnemonics = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> expectedDataFirst5Rows = logData.Logs.First().LogData.Data.Select(d => d.Data);
            IEnumerable<string> expectedDataLast5Rows = logData.Logs.Last().LogData.Data.Select(d => d.Data);
            IEnumerable<string> newLogDataData = newLogData.Data.Select(d => d.Data);

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(expectedDataFirst5Rows, newLogDataData.Take(5));
            Assert.Equal(expectedDataLast5Rows, newLogDataData.TakeLast(5));
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_SomeOverlap_KeepsFirstOnOverlap(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 5 }; // start indexes for each log
            int[] endIndexNum = { 9, 14 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var expectedMnemonics = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> expectedDataFirst10Rows = logData.Logs.First().LogData.Data.Select(d => d.Data);
            IEnumerable<string> expectedDataLast5Rows = logData.Logs.Last().LogData.Data.Select(d => d.Data).TakeLast(5);
            IEnumerable<string> newLogDataData = newLogData.Data.Select(d => d.Data);

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(expectedDataFirst10Rows, newLogDataData.Take(10));
            Assert.Equal(expectedDataLast5Rows, newLogDataData.TakeLast(5));
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_ManyLogs_NoOverlap_KeepsFirstAll(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid", "log3Uid", "log4Uid", "log5Uid" };
            int[] startIndexNum = { 0, 5, 10, 15, 20 }; // start indexes for each log
            int[] endIndexNum = { 4, 9, 14, 19, 24 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var expectedMnemonics = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataData = newLogData.Data.Select(d => d.Data);

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(logData.Logs[0].LogData.Data.Select(d => d.Data).TakeLast(5), newLogDataData.Take(5));
            Assert.Equal(logData.Logs[1].LogData.Data.Select(d => d.Data).TakeLast(5), newLogDataData.Skip(5).Take(5));
            Assert.Equal(logData.Logs[2].LogData.Data.Select(d => d.Data).TakeLast(5), newLogDataData.Skip(10).Take(5));
            Assert.Equal(logData.Logs[3].LogData.Data.Select(d => d.Data).TakeLast(5), newLogDataData.Skip(15).Take(5));
            Assert.Equal(logData.Logs[4].LogData.Data.Select(d => d.Data).TakeLast(5), newLogDataData.Skip(20).Take(5));
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_SomeCurvesOverlap_KeepsFirstCurveOnOverlap(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 5 }; // start indexes for each log
            int[] endIndexNum = { 9, 14 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var data = logData.Logs.First().LogData.Data.Last().Data.Split(CommonConstants.DataSeparator);
            data[1] = string.Empty;
            logData.Logs.First().LogData.Data.Last().Data = string.Join(CommonConstants.DataSeparator, data);

            var expectedMnemonics = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.First().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> expectedDataFirst8Rows = logData.Logs.First().LogData.Data.Select(d => d.Data).Take(8);
            IEnumerable<string> expectedDataLast5Rows = logData.Logs.Last().LogData.Data.Select(d => d.Data).TakeLast(5);
            IEnumerable<string> newLogDataData = newLogData.Data.Select(d => d.Data);
            var log1Value = logData.Logs.First().LogData.Data.Select(d => d.Data).ToArray().Last().Split(CommonConstants.DataSeparator);
            var log2Value = logData.Logs.Last().LogData.Data.Select(d => d.Data).ToArray().First().Split(CommonConstants.DataSeparator);
            log1Value[1] = log2Value[1];
            string expectedDataRow10 = string.Join(CommonConstants.DataSeparator, log1Value);

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(expectedDataFirst8Rows, newLogDataData.Take(8));
            Assert.Equal(expectedDataRow10, newLogDataData.ToArray()[9]);
            Assert.Equal(expectedDataLast5Rows, newLogDataData.TakeLast(5));
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_NewCurve_AddsNewCurve(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 10, 10 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            logHeaders.Logs.Last().LogCurveInfo.Add(new WitsmlLogCurveInfo()
            {
                Mnemonic = "ExtraCurve",
                Unit = "Unit3",
                MinIndex = isDepthLog ? new WitsmlIndex() { Value = "0", Uom = CommonConstants.Unit.Meter } : null,
                MinDateTimeIndex = isDepthLog ? null : _baseDateTime.ToISODateTimeString(),
                MaxIndex = isDepthLog ? new WitsmlIndex() { Value = "10", Uom = CommonConstants.Unit.Meter } : null,
                MaxDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(10).ToISODateTimeString()
            });

            foreach (var data in logData.Logs.Last().LogData.Data)
            {
                data.Data = $"{data.Data},12345";
            }
            logData.Logs.Last().LogData.MnemonicList = $"{logData.Logs.Last().LogData.MnemonicList},ExtraCurve";
            logData.Logs.Last().LogData.UnitList = $"{logData.Logs.Last().LogData.UnitList},Unit3";

            var expectedMnemonics = logHeaders.Logs.Last().LogCurveInfo.Select(lci => lci.Mnemonic);
            var expectedUnits = logHeaders.Logs.Last().LogCurveInfo.Select(lci => lci.Unit);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLogData> newLogDatas = capturedLogData.Select(data => data.Logs.First().LogData).ToList();
            WitsmlLogData newLogData = GetMergedLogData(newLogDatas, indexType);
            IEnumerable<string> newLogHeaderMnemonics = newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic);
            IEnumerable<string> newLogHeaderUnits = newLogHeader.LogCurveInfo.Select(lci => lci.Unit);
            IEnumerable<string> newLogDataMnemonics = newLogData.MnemonicList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> newLogDataUnits = newLogData.UnitList.Split(CommonConstants.DataSeparator);
            IEnumerable<string> expectedDataExceptLastMnemonic = logData.Logs.First().LogData.Data.Select(d => d.Data);
            IEnumerable<string> expectedDataLastMnemonic = logData.Logs.Last().LogData.Data.Select(d => d.Data.Split(CommonConstants.DataSeparator).Last());
            IEnumerable<string> newLogDataWithoutLastMnemonic = newLogData.Data.Select(d => string.Join(CommonConstants.DataSeparator, d.Data.Split(CommonConstants.DataSeparator).SkipLast(1)));
            IEnumerable<string> newLogDataLastMnemonic = newLogData.Data.Select(d => d.Data.Split(CommonConstants.DataSeparator).Last());

            Assert.Equal(expectedMnemonics, newLogHeaderMnemonics);
            Assert.Equal(expectedUnits, newLogHeaderUnits);
            Assert.Equal(expectedMnemonics, newLogDataMnemonics);
            Assert.Equal(expectedUnits, newLogDataUnits);
            Assert.Equal(expectedDataExceptLastMnemonic, newLogDataWithoutLastMnemonic);
            Assert.Equal(expectedDataLastMnemonic, newLogDataLastMnemonic);
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_IndexCurveNotFirstInLCI_HasCorrectHeader(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 10, 10 }; // end indexes for each log
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add);

            // Move index curve to last position in LogCurveInfo for all the logHeaders.
            foreach (var logHeader in logHeaders.Logs)
            {
                var indexCurveLCI = logHeader.LogCurveInfo.FirstOrDefault();
                logHeader.LogCurveInfo.Remove(indexCurveLCI);
                logHeader.LogCurveInfo.Add(indexCurveLCI);
            }

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();

            Assert.Equal("IndexCurve", newLogHeader.LogCurveInfo.First().Mnemonic);
        }

        [Theory]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_MD)]
        [InlineData(WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)]
        public async Task Execute_DifferentIndexCurveNames_HasCorrectHeader(string indexType)
        {
            string[] logUids = { "log1Uid", "log2Uid" };
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 10, 10 }; // end indexes for each log
            string[] indexCurves = { "IndexCurve1", "IndexCurve2" };
            WitsmlLogs capturedLogHeader = null;
            List<WitsmlLogs> capturedLogData = new();

            var (job, logHeaders, logData) = SetupTest(logUids, indexType, startIndexNum, endIndexNum, (log) => capturedLogHeader = log, capturedLogData.Add, indexCurves);

            var (workerResult, refreshAction) = await _worker.Execute(job);

            WitsmlLog newLogHeader = capturedLogHeader.Logs.First();
            List<WitsmlLog> newLogDataHeaders = capturedLogData.Select(data => data.Logs.First()).ToList();

            // When Log Curve Info varies between logs, the Log Curve Info of the last log is prioritized.
            Assert.Equal("IndexCurve2", newLogHeader.IndexCurve.Value);
            Assert.Equal("IndexCurve2", newLogHeader.LogCurveInfo.First().Mnemonic);
            Assert.All(newLogDataHeaders, newLogDataHeader =>
            {
                Assert.Equal("IndexCurve2", newLogDataHeader.LogData.MnemonicList.Split(CommonConstants.DataSeparator)[0]);
            });
        }

        private (SpliceLogsJob, WitsmlLogs, WitsmlLogs) SetupTest(string[] logUids, string indexType, int[] startIndexNum, int[] endIndexNum, Action<WitsmlLogs> logHeaderCallback, Action<WitsmlLogs> logDataCallback, string[] indexCurves = null)
        {
            SpliceLogsJob job = CreateSpliceLogsJob(logUids);
            WitsmlLogs logHeaders = CreateSampleLogHeaders(logUids, indexType, startIndexNum, endIndexNum, indexCurves);
            WitsmlLogs logData = CreateSampleLogData(logUids, indexType, startIndexNum, endIndexNum, indexCurves);
            SetupClient(_witsmlClient, logHeaders, logData, logHeaderCallback, logDataCallback);
            return (job, logHeaders, logData);
        }

        private SpliceLogsJob CreateSpliceLogsJob(string[] logUids)
        {
            return new SpliceLogsJob
            {
                Logs = new ObjectReferences
                {
                    WellUid = _wellUid,
                    WellboreUid = _wellboreUid,
                    ObjectUids = logUids,
                    WellName = _wellUid,
                    WellboreName = _wellboreUid,
                    Names = logUids
                },
                NewLogName = _newLogName,
                NewLogUid = _newLogUid,
                JobInfo = new()
            };
        }

        private WitsmlLogs CreateSampleLogHeaders(string[] logUids, string indexType, int[] startIndexNum, int[] endIndexNum, string[] indexCurves = null)
        {
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            return new WitsmlLogs
            {
                Logs = logUids.Select((uid, i) => new WitsmlLog
                {
                    Uid = uid,
                    UidWell = _wellUid,
                    UidWellbore = _wellboreUid,
                    Direction = WitsmlLog.WITSML_DIRECTION_INCREASING,
                    IndexType = indexType,
                    StartIndex = isDepthLog ? new WitsmlIndex() { Value = startIndexNum[i].ToString(), Uom = CommonConstants.Unit.Meter } : null,
                    StartDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(startIndexNum[i]).ToISODateTimeString(),
                    EndIndex = isDepthLog ? new WitsmlIndex() { Value = (endIndexNum[i]).ToString(), Uom = CommonConstants.Unit.Meter } : null,
                    EndDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(endIndexNum[i]).ToISODateTimeString(),
                    IndexCurve = new WitsmlIndexCurve() { Value = indexCurves != null ? indexCurves[i] : "IndexCurve" },
                    LogCurveInfo = GetLogCurveInfo(logUids, uid, indexType, startIndexNum, endIndexNum, indexCurves)
                }).ToList()
            };
        }

        private WitsmlLogs CreateSampleLogData(string[] logUids, string indexType, int[] startIndexNum, int[] endIndexNum, string[] indexCurves = null)
        {
            return new WitsmlLogs
            {
                Logs = logUids.Select((uid, i) => new WitsmlLog
                {
                    Uid = uid,
                    UidWell = _wellUid,
                    UidWellbore = _wellboreUid,
                    LogData = new()
                    {
                        MnemonicList = indexCurves != null ? $"{indexCurves[i]},Curve1,Curve2" : "IndexCurve,Curve1,Curve2",
                        UnitList = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? "m,Unit1,Unit2" : "DateTime,Unit1,Unit2",
                        Data = GetLogData(logUids, uid, indexType, startIndexNum, endIndexNum)
                    }
                }
                ).ToList()
            };
        }

        private List<WitsmlData> GetLogData(string[] logUids, string uid, string indexType, int[] startIndexNum, int[] endIndexNum)
        {
            var uidNum = logUids.ToList().FindIndex(i => i == uid);
            IEnumerable<string> depthIndexes = Enumerable.Range(startIndexNum[uidNum], endIndexNum[uidNum] - startIndexNum[uidNum] + 1).Select(n => n.ToString()).ToList();
            IEnumerable<string> timeIndexes = Enumerable.Range(startIndexNum[uidNum], endIndexNum[uidNum] - startIndexNum[uidNum] + 1).Select(n => _baseDateTime.AddMinutes(n).ToISODateTimeString());
            IEnumerable<string> indexes = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? depthIndexes : timeIndexes;
            return indexes.Select((curveIndex, index) => new WitsmlData() { Data = $"{curveIndex},{uidNum},{index}" }).ToList();
        }

        private List<WitsmlLogCurveInfo> GetLogCurveInfo(string[] logUids, string uid, string indexType, int[] startIndexNum, int[] endIndexNum, string[] indexCurves = null)
        {
            var uidNum = logUids.ToList().FindIndex(i => i == uid);
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            var minIndex = isDepthLog ? new WitsmlIndex() { Value = startIndexNum[uidNum].ToString(), Uom = CommonConstants.Unit.Meter } : null;
            var minDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(startIndexNum[uidNum]).ToISODateTimeString();
            var maxIndex = isDepthLog ? new WitsmlIndex() { Value = (endIndexNum[uidNum]).ToString(), Uom = CommonConstants.Unit.Meter } : null;
            var maxDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(endIndexNum[uidNum]).ToISODateTimeString();
            return new()
            {
                new WitsmlLogCurveInfo
                {
                    Mnemonic = indexCurves != null ? indexCurves[uidNum] : "IndexCurve",
                    Unit = isDepthLog ? CommonConstants.Unit.Meter : "DateTime",
                    MinIndex = minIndex,
                    MinDateTimeIndex = minDateTimeIndex,
                    MaxIndex = maxIndex,
                    MaxDateTimeIndex = maxDateTimeIndex
                },
                new WitsmlLogCurveInfo
                {
                    Mnemonic = "Curve1",
                    Unit = "Unit1",
                    MinIndex = minIndex,
                    MinDateTimeIndex = minDateTimeIndex,
                    MaxIndex = maxIndex,
                    MaxDateTimeIndex = maxDateTimeIndex
                },
                new WitsmlLogCurveInfo
                {
                    Mnemonic = "Curve2",
                    Unit = "Unit2",
                    MinIndex = minIndex,
                    MinDateTimeIndex = minDateTimeIndex,
                    MaxIndex = maxIndex,
                    MaxDateTimeIndex = maxDateTimeIndex
                }
            };
        }

        private void SetupClient(Mock<IWitsmlClient> witsmlClient, WitsmlLogs logHeaders, WitsmlLogs logData, Action<WitsmlLogs> logHeaderCallback, Action<WitsmlLogs> logDataCallback)
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
                    string mnemonic = logs.Logs.First().LogData.MnemonicList.Split(CommonConstants.DataSeparator)[1];
                    int mnemonicIndex = log.LogData.MnemonicList.Split(CommonConstants.DataSeparator).ToList().FindIndex(m => m == mnemonic);
                    IEnumerable<string> dataForCurve = data.Select(dataRow => $"{dataRow.Split(CommonConstants.DataSeparator)[0]},{dataRow.Split(CommonConstants.DataSeparator)[mnemonicIndex]}");
                    IEnumerable<string> dataForCurveWithinRange = GetDataWithinRange(dataForCurve, logs.Logs.First());
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
                                Data = dataForCurveWithinRange.Select(d => new WitsmlData() { Data = d }).ToList()
                            }
                        }.AsItemInList()
                    };
                    return Task.FromResult(newLogData);
                }
                throw new ArgumentException("The sent request has not been mocked.");
            });

            // Mock creating new log
            witsmlClient.Setup(client =>
                client.AddToStoreAsync(It.IsAny<WitsmlLogs>()))
                .Returns((WitsmlLogs logs) =>
            {
                logHeaderCallback(logs);
                return Task.FromResult(new QueryResult(true));
            });

            // Mock adding data to the new log
            witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()))
                .Returns((WitsmlLogs logs) =>
            {
                logDataCallback(logs);
                return Task.FromResult(new QueryResult(true));
            });
        }

        private IEnumerable<string> GetDataWithinRange(IEnumerable<string> data, WitsmlLog log)
        {
            if (log.StartIndex != null)
            {
                data = data.Where(dataRow => StringHelpers.ToDouble(dataRow.Split(CommonConstants.DataSeparator)[0]) >= StringHelpers.ToDouble(log.StartIndex.Value));
            }
            if (log.EndIndex != null)
            {
                data = data.Where(dataRow => StringHelpers.ToDouble(dataRow.Split(CommonConstants.DataSeparator)[0]) <= StringHelpers.ToDouble(log.EndIndex.Value));
            }
            if (log.StartDateTimeIndex != null)
            {
                data = data.Where(dataRow => DateTime.Parse(dataRow.Split(CommonConstants.DataSeparator)[0]) >= DateTime.Parse(log.StartDateTimeIndex));
            }
            if (log.EndDateTimeIndex != null)
            {
                data = data.Where(dataRow => DateTime.Parse(dataRow.Split(CommonConstants.DataSeparator)[0]) <= DateTime.Parse(log.EndDateTimeIndex));
            }
            return data;
        }

        private WitsmlLogData GetMergedLogData(List<WitsmlLogData> logDatas, string indexType)
        {
            List<string> mnemonics = logDatas.SelectMany(data => data.MnemonicList.Split(CommonConstants.DataSeparator)).Distinct().ToList();
            List<string> units = new();
            List<List<string>> mergedData = new();
            for (int i = 0; i < mnemonics.Count; i++)
            {
                string mnemonic = mnemonics[i];
                WitsmlLogData logWithMnemonic = logDatas.Find(data => data.MnemonicList.Split(CommonConstants.DataSeparator).Contains(mnemonic));
                int mnemonicIndex = logWithMnemonic.MnemonicList.Split(CommonConstants.DataSeparator).ToList().IndexOf(mnemonic);
                string unit = logWithMnemonic.UnitList.Split(CommonConstants.DataSeparator)[mnemonicIndex];
                units.Add(unit);
                foreach (List<string> dataPoints in logWithMnemonic.Data.Select(d => d.Data.Split(CommonConstants.DataSeparator).ToList()))
                {
                    string index = dataPoints[0];
                    string mnemonicDataPoint = dataPoints[mnemonicIndex];
                    int dataIndex = mergedData.FindIndex(d => d[0] == index);
                    if (dataIndex > -1)
                    {
                        mergedData[dataIndex][i] = mnemonicDataPoint;
                    }
                    else
                    {
                        List<string> newRow = new List<string>();
                        newRow.AddRange(Enumerable.Repeat("", mnemonics.Count)); // Initialize empty row
                        newRow[0] = index;
                        newRow[mnemonics.IndexOf(mnemonic)] = mnemonicDataPoint;
                        mergedData.Add(newRow);
                    }
                }
            }
            if (indexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                mergedData = mergedData.OrderBy(row => StringHelpers.ToDouble(row[0])).ToList();
            }
            else
            {
                mergedData = mergedData.OrderBy(row => DateTime.Parse(row[0])).ToList();
            }
            return new WitsmlLogData
            {
                MnemonicList = string.Join(CommonConstants.DataSeparator, mnemonics),
                UnitList = string.Join(CommonConstants.DataSeparator, units),
                Data = mergedData.Select(dataRow => new WitsmlData
                {
                    Data = string.Join(CommonConstants.DataSeparator, dataRow)
                }
                ).ToList()
            };
        }
    }
}
