using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{
    public class CompareLogDataWorkerTests
    {
        private readonly string _sourceWellUid = "sourcewelluid";
        private readonly string _sourceWellboreUid = "sourcewellboreuid";
        private readonly string _sourceLogUid = "sourceLogUid";
        private readonly string _targetWellUid = "targetwelluid";
        private readonly string _targetWellboreUid = "targetwellboreuid";
        private readonly string _targetLogUid = "targetloguid";
        private readonly DateTime _baseDateTime = DateTime.Parse("2023-09-28T08:10:00Z", CultureInfo.InvariantCulture);
        private readonly Mock<IWitsmlClientProvider> _witsmlClientProvider;
        private readonly Mock<IWitsmlClient> _witsmlSourceClient;
        private readonly Mock<IWitsmlClient> _witsmlTargetClient;
        private readonly Mock<ILogger<CompareLogDataJob>> _logger;
        private readonly CompareLogDataWorker _worker;

        public CompareLogDataWorkerTests()
        {
            _witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlSourceClient = new Mock<IWitsmlClient>();
            _witsmlTargetClient = new Mock<IWitsmlClient>();
            _logger = new Mock<ILogger<CompareLogDataJob>>();
            _witsmlClientProvider.Setup(provider => provider.GetSourceClient()).Returns(_witsmlSourceClient.Object);
            _witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlTargetClient.Object);
            _worker = new CompareLogDataWorker(_logger.Object, _witsmlClientProvider.Object);
        }

        [Fact]
        public async Task CompareLogData_Equal_Logs()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 1, 1 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> sourceData = new() { "0,0", "0,0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> targetData = new() { "0,0", "0,0" };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 0;

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);
        }

        [Fact]
        public async Task CompareLogData_Different_Mnemonics_DepthLog()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 1, 1 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> sourceData = new() { "0,0", "0,0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1") };
            List<string> targetData = new() { "0", "1" };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 3;

            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("1", "Curve1", "0", "1");
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("0", "Curve2", "0", null);
            CompareLogDataItem expectedMismatchItem3 = CreateCompareLogDataItem("1", "Curve2", "0", null);

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);

            Assert.Equal(expectedMismatchItem3.Index, resultReportItems[2].Index);
            Assert.Equal(expectedMismatchItem3.Mnemonic, resultReportItems[2].Mnemonic);
            Assert.Equal(expectedMismatchItem3.SourceValue, resultReportItems[2].SourceValue);
            Assert.Equal(expectedMismatchItem3.TargetValue, resultReportItems[2].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_Different_Mnemonics_TimeLog()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 1, 1 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> sourceData = new() { "0,0", "0,0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1") };
            List<string> targetData = new() { "0", "1" };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 3;

            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("2023-09-28T08:11:00.000Z", "Curve1", "0", "1");
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("2023-09-28T08:10:00.000Z", "Curve2", "0", null);
            CompareLogDataItem expectedMismatchItem3 = CreateCompareLogDataItem("2023-09-28T08:11:00.000Z", "Curve2", "0", null);

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);

            Assert.Equal(expectedMismatchItem3.Index, resultReportItems[2].Index);
            Assert.Equal(expectedMismatchItem3.Mnemonic, resultReportItems[2].Mnemonic);
            Assert.Equal(expectedMismatchItem3.SourceValue, resultReportItems[2].SourceValue);
            Assert.Equal(expectedMismatchItem3.TargetValue, resultReportItems[2].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_Different_Index_Range_DepthLog()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            int[] startIndexNum = { 0, 3 }; // start indexes for each log
            int[] endIndexNum = { 1, 4 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1") };
            List<string> sourceData = new() { "0", "0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1") };
            List<string> targetData = new() { "0", "0" };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 4;

            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("0", "Curve1", "0", null);
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("1", "Curve1", "0", null);
            CompareLogDataItem expectedMismatchItem3 = CreateCompareLogDataItem("3", "Curve1", null, "0");
            CompareLogDataItem expectedMismatchItem4 = CreateCompareLogDataItem("4", "Curve1", null, "0");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);

            Assert.Equal(expectedMismatchItem2.Index, resultReportItems[1].Index);
            Assert.Equal(expectedMismatchItem2.Mnemonic, resultReportItems[1].Mnemonic);
            Assert.Equal(expectedMismatchItem2.SourceValue, resultReportItems[1].SourceValue);
            Assert.Equal(expectedMismatchItem2.TargetValue, resultReportItems[1].TargetValue);

            Assert.Equal(expectedMismatchItem3.Index, resultReportItems[2].Index);
            Assert.Equal(expectedMismatchItem3.Mnemonic, resultReportItems[2].Mnemonic);
            Assert.Equal(expectedMismatchItem3.SourceValue, resultReportItems[2].SourceValue);
            Assert.Equal(expectedMismatchItem3.TargetValue, resultReportItems[2].TargetValue);

            Assert.Equal(expectedMismatchItem4.Index, resultReportItems[3].Index);
            Assert.Equal(expectedMismatchItem4.Mnemonic, resultReportItems[3].Mnemonic);
            Assert.Equal(expectedMismatchItem4.SourceValue, resultReportItems[3].SourceValue);
            Assert.Equal(expectedMismatchItem4.TargetValue, resultReportItems[3].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_Overlapping_Data_DepthLog()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 2, 2 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> sourceData = new() { "0,0", "0,0", "0,0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> targetData = new() { "0,0", "1,0", "0,0" };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 1;

            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("1", "Curve1", "0", "1");

            Assert.Equal(expectedNumberOfMismatches, resultReportItems.Count);

            Assert.Equal(expectedMismatchItem1.Index, resultReportItems[0].Index);
            Assert.Equal(expectedMismatchItem1.Mnemonic, resultReportItems[0].Mnemonic);
            Assert.Equal(expectedMismatchItem1.SourceValue, resultReportItems[0].SourceValue);
            Assert.Equal(expectedMismatchItem1.TargetValue, resultReportItems[0].TargetValue);
        }

        [Fact]
        public async Task CompareLogData_Missing_Data_DepthLog()
        {
            string indexType = WitsmlLog.WITSML_INDEX_TYPE_MD;
            int[] startIndexNum = { 0, 0 }; // start indexes for each log
            int[] endIndexNum = { 2, 2 }; // end indexes for each log
            List<(string, string)> sourceLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> sourceData = new() { "0,0", ",0", "0,0" };

            List<(string, string)> targetLogCurveInfo = new() { ("Curve1", "Unit1"), ("Curve2", "Unit2") };
            List<string> targetData = new() { "0,0", "0,0", "0," };

            var (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData) = SetupTest(indexType, startIndexNum, endIndexNum, sourceLogCurveInfo, sourceData, targetLogCurveInfo, targetData);
            var (workerResult, refreshAction) = await _worker.Execute(job);

            Console.WriteLine(job.JobInfo.Report);
            List<CompareLogDataItem> resultReportItems = job.JobInfo.Report.ReportItems.Select(x => (CompareLogDataItem)x).ToList();
            int expectedNumberOfMismatches = 2;

            CompareLogDataItem expectedMismatchItem1 = CreateCompareLogDataItem("1", "Curve1", "", "0");
            CompareLogDataItem expectedMismatchItem2 = CreateCompareLogDataItem("2", "Curve2", "0", "");

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

        private (CompareLogDataJob, WitsmlLogs, WitsmlLogs, WitsmlLogs, WitsmlLogs) SetupTest(string indexType, int[] startIndexNum, int[] endIndexNum, List<(string, string)> sourceLogCurveInfo, List<string> sourceData, List<(string, string)> targetLogCurveInfo, List<string> targetData)
        {
            CompareLogDataJob job = CreateCompareLogDataJob();
            WitsmlLogs sourceLogHeader = CreateSampleLogHeaders(_sourceWellUid, _sourceWellboreUid, _sourceLogUid, indexType, startIndexNum[0], endIndexNum[0], sourceLogCurveInfo);
            WitsmlLogs targetLogHeader = CreateSampleLogHeaders(_targetWellUid, _targetWellboreUid, _targetLogUid, indexType, startIndexNum[1], endIndexNum[1], targetLogCurveInfo);
            WitsmlLogs sourceLogData = CreateSampleLogData(_sourceWellUid, _sourceWellboreUid, _sourceLogUid, indexType, startIndexNum[0], endIndexNum[0], sourceLogCurveInfo, sourceData);
            WitsmlLogs targetLogData = CreateSampleLogData(_targetWellUid, _targetWellboreUid, _targetLogUid, indexType, startIndexNum[1], endIndexNum[1], targetLogCurveInfo, targetData);
            SetupClient(_witsmlSourceClient, sourceLogHeader, sourceLogData);
            SetupClient(_witsmlTargetClient, targetLogHeader, targetLogData);
            return (job, sourceLogHeader, targetLogHeader, sourceLogData, targetLogData);
        }

        private void SetupClient(Mock<IWitsmlClient> witsmlClient, WitsmlLogs logHeaders, WitsmlLogs logData)
        {
            int getDataCount = 0;
            // Mock fetching log
            witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>()))
                .Returns((WitsmlLogs logs, OptionsIn options) =>
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
                    string mnemonic = logs.Logs.First().LogData.MnemonicList.Split(',')[1];
                    int mnemonicIndex = log.LogData.MnemonicList.Split(',').ToList().FindIndex(m => m == mnemonic);
                    IEnumerable<string> dataForCurve = data.Select(dataRow => $"{dataRow.Split(',')[0]},{dataRow.Split(',')[mnemonicIndex]}");
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
                        }.AsSingletonList()
                    };
                    return Task.FromResult(newLogData);
                }
                throw new ArgumentException("The sent request has not been mocked.");
            });
        }

        private WitsmlLogs CreateSampleLogData(string wellUid, string wellboreUid, string logUid, string indexType, int startIndexNum, int endIndexNum, List<(string, string)> logMnemonics, List<string> logData)
        {
            string mnemonicsList = "IndexCurve";
            string unitList = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? "m" : "DateTime";
            foreach ((string, string) mnemonic in logMnemonics)
            {
                mnemonicsList += "," + mnemonic.Item1;
                unitList += "," + mnemonic.Item2;
            }
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
                        Data = GetLogData(indexType, startIndexNum, endIndexNum, logData)
                    }
                }.AsSingletonList()
            };
        }

        private List<WitsmlData> GetLogData(string indexType, int startIndexNum, int endIndexNum, List<string> logData)
        {
            IEnumerable<string> depthIndexes = Enumerable.Range(startIndexNum, endIndexNum - startIndexNum + 1).Select(n => n.ToString()).ToList();
            IEnumerable<string> timeIndexes = Enumerable.Range(startIndexNum, endIndexNum - startIndexNum + 1).Select(n => _baseDateTime.AddMinutes(n).ToISODateTimeString());
            IEnumerable<string> indexes = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? depthIndexes : timeIndexes;
            // TODO: change data values
            return indexes.Select((curveIndex, index) => new WitsmlData() { Data = $"{curveIndex},{logData[index]}" }).ToList();
        }

        private WitsmlLogs CreateSampleLogHeaders(string wellUid, string wellboreUid, string logUid, string indexType, int startIndexNum, int endIndexNum, List<(string, string)> logCurveInfo)
        {
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Direction = WitsmlLog.WITSML_DIRECTION_INCREASING,
                    IndexType = indexType,
                    StartIndex = isDepthLog ? new WitsmlIndex() { Value = startIndexNum.ToString(), Uom = "m" } : null,
                    StartDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(startIndexNum).ToISODateTimeString(),
                    EndIndex = isDepthLog ? new WitsmlIndex() { Value = endIndexNum.ToString(), Uom = "m" } : null,
                    EndDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(endIndexNum).ToISODateTimeString(),
                    IndexCurve = new WitsmlIndexCurve() { Value = "IndexCurve" },
                    LogCurveInfo = GetLogCurveInfo(indexType, startIndexNum, endIndexNum, logCurveInfo)
                }.AsSingletonList(),
            };
        }

        private List<WitsmlLogCurveInfo> GetLogCurveInfo(string indexType, int startIndexNum, int endIndexNum, List<(string, string)> logCurveInfo)
        {
            var isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            var minIndex = isDepthLog ? new WitsmlIndex() { Value = startIndexNum.ToString(), Uom = "m" } : null;
            var minDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(startIndexNum).ToISODateTimeString();
            var maxIndex = isDepthLog ? new WitsmlIndex() { Value = (endIndexNum).ToString(), Uom = "m" } : null;
            var maxDateTimeIndex = isDepthLog ? null : _baseDateTime.AddMinutes(endIndexNum).ToISODateTimeString();
            var curveInfo = logCurveInfo.Select(mnemonic => new WitsmlLogCurveInfo
            {
                Mnemonic = mnemonic.Item1,
                Unit = mnemonic.Item2,
                MinIndex = minIndex,
                MinDateTimeIndex = minDateTimeIndex,
                MaxIndex = maxIndex,
                MaxDateTimeIndex = maxDateTimeIndex
            }).ToList();

            curveInfo.Insert(0, new WitsmlLogCurveInfo
            {
                Mnemonic = "IndexCurve",
                Unit = isDepthLog ? "m" : "DateTime",
                MinIndex = minIndex,
                MinDateTimeIndex = minDateTimeIndex,
                MaxIndex = maxIndex,
                MaxDateTimeIndex = maxDateTimeIndex
            });

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

        private CompareLogDataJob CreateCompareLogDataJob()
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
                JobInfo = new()
            };
        }
    }
}
