using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers
{

    public class MinimumDataQcWorkerTests
    {
        private const string LogUid = "logUid";
        private const string WellUid = "wellUid";
        private const string WellboreUid = "wellboreUid";
        private const string DepthMnemonicList = "Depth,BPOS,SPM1,SPM2";
        private const string TimeMnemonicList = "Time,BPOS,SPM1,SPM2";

        private const string DepthDataRow1 = "51,88,100,222";
        private const string DepthDataRow2 = "52,88,100,222";
        private const string DepthDataRow3 = "53,88,100,222";
        private const string DepthDataRow4 = "54,88,100,222";
        private const string DepthDataRow5 = "55,88,100,222";

        private const string DepthDataWithIssuesRow1 = "51,88,,222";
        private const string DepthDataWithIssuesRow2 = "52,,,";
        private const string DepthDataWithIssuesRow3 = "53,92,,222";
        private const string DepthDataWithIssuesRow4 = "54,,,222";
        private const string DepthDataWithIssuesRow5 = "55,,,222";
        private const string DepthDataWithIssuesRow6 = "56,98,,222";

        private const string TimeDataRow1 = "2023-04-19T00:00:00Z,88,100,222";
        private const string TimeDataRow2 = "2023-04-19T00:00:01Z,88,100,222";
        private const string TimeDataRow3 = "2023-04-19T00:00:02Z,88,100,222";
        private const string TimeDataRow4 = "2023-04-19T00:00:03Z,88,100,222";
        private const string TimeDataRow5 = "2023-04-19T00:00:04Z,88,100,222";

        private const string TimeDataWithIssuesRow1 = "2023-04-19T00:00:00Z,,100,222";
        private const string TimeDataWithIssuesRow2 = "2023-04-19T00:00:01Z,,,";
        private const string TimeDataWithIssuesRow3 = "2023-04-19T00:00:02Z,,,222";
        private const string TimeDataWithIssuesRow4 = "2023-04-19T00:00:03Z,,130,222";
        private const string TimeDataWithIssuesRow5 = "2023-04-19T00:00:04Z,,,222";
        private const string TimeDataWithIssuesRow6 = "2023-04-19T00:00:05Z,,150,222";


        private readonly Mock<IWitsmlClient> _witsmlClient;
        private readonly MinimumDataQcWorker _worker;

        public MinimumDataQcWorkerTests()
        {
            var witsmlClientProvider = new Mock<IWitsmlClientProvider>();
            _witsmlClient = new Mock<IWitsmlClient>();
            witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
            ILoggerFactory loggerFactory = new LoggerFactory();
            loggerFactory.AddSerilog(Log.Logger);
            ILogger<MinimumDataQcJob> logger = loggerFactory.CreateLogger<MinimumDataQcJob>();
            _worker = new MinimumDataQcWorker(logger, witsmlClientProvider.Object);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task MinDataQc_Depth_WithGaps_WithLowDensity(bool isIncreasing)
        {
            var testStart = DateTime.Now;
            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, 2.9, null);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD, isLogDataWithIssues: true, isIncreasing: isIncreasing);
            (_, _) = await _worker.Execute(job);

            Assert.IsType<MinimumDataQcReport>(jobInfo.Report);
            var report = (MinimumDataQcReport)jobInfo.Report;
            Assert.Equal("Minimum data QC report", report.Title);
            Assert.Equal("Analyzed 3 mnemonics, found 2 QC issues.", report.Summary);
            Assert.NotEmpty(report.ReportItems);
            Assert.Equal(3, report.ReportItems.Count());
            Assert.Collection(
                report.ReportItems,
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("BPOS", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.NotEmpty(qri.QcIssues);
                    Assert.Equal(2, qri.QcIssues.Count());
                    Assert.Contains(QcIssue.LARGE_GAP, qri.QcIssues);
                    Assert.Contains(QcIssue.LOW_DENSITY, qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM1", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.NotEmpty(qri.QcIssues);
                    Assert.Single(qri.QcIssues);
                    Assert.Contains(QcIssue.NO_DATA, qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM2", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                }
            );
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task MinDataQc_Time_WithGaps_WithLowDensity(bool isIncreasing)
        {
            var testStart = DateTime.Now;
            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 3000.0, null, 2000);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, isLogDataWithIssues: true, isIncreasing: isIncreasing);
            (_, _) = await _worker.Execute(job);

            Assert.IsType<MinimumDataQcReport>(jobInfo.Report);
            var report = (MinimumDataQcReport)jobInfo.Report;
            Assert.Equal("Minimum data QC report", report.Title);
            Assert.Equal("Analyzed 3 mnemonics, found 2 QC issues.", report.Summary);
            Assert.NotEmpty(report.ReportItems);
            Assert.Equal(3, report.ReportItems.Count());
            Assert.Collection(
                report.ReportItems,
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("BPOS", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.NotEmpty(qri.QcIssues);
                    Assert.Single(qri.QcIssues);
                    Assert.Contains(QcIssue.NO_DATA, qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM1", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.NotEmpty(qri.QcIssues);
                    Assert.Equal(2, qri.QcIssues.Count());
                    Assert.Contains(QcIssue.LARGE_GAP, qri.QcIssues);
                    Assert.Contains(QcIssue.LOW_DENSITY, qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM2", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                }
            );
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task MinDataQc_Depth_NoGaps_OkDensity(bool isIncreasing)
        {
            var testStart = DateTime.Now;
            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, 2.9, null);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD, isLogDataWithIssues: false, isIncreasing: isIncreasing);
            (_, _) = await _worker.Execute(job);

            Assert.IsType<MinimumDataQcReport>(jobInfo.Report);
            var report = (MinimumDataQcReport)jobInfo.Report;
            Assert.Equal("Minimum data QC report", report.Title);
            Assert.Equal("Analyzed 3 mnemonics, found 0 QC issues.", report.Summary);
            Assert.NotEmpty(report.ReportItems);
            Assert.Equal(3, report.ReportItems.Count());
            Assert.Collection(
                report.ReportItems,
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("BPOS", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM1", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM2", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                }
            );
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task MinDataQc_Time_NoGaps_OkDensity(bool isIncreasing)
        {
            var testStart = DateTime.Now;
            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 3000.0, null, 2000);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, isLogDataWithIssues: false, isIncreasing: isIncreasing);
            (_, _) = await _worker.Execute(job);

            Assert.IsType<MinimumDataQcReport>(jobInfo.Report);
            var report = (MinimumDataQcReport)jobInfo.Report;
            Assert.Equal("Minimum data QC report", report.Title);
            Assert.Equal("Analyzed 3 mnemonics, found 0 QC issues.", report.Summary);
            Assert.NotEmpty(report.ReportItems);
            Assert.Equal(3, report.ReportItems.Count());
            Assert.Collection(
                report.ReportItems,
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("BPOS", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM1", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                },
                ri =>
                {
                    Assert.IsType<MinimumDataQcReportItem>(ri);
                    var qri = (MinimumDataQcReportItem)ri;
                    Assert.Equal("SPM2", qri.Mnemonic);
                    Assert.InRange(qri.Timestamp, testStart, DateTime.Now);
                    Assert.Empty(qri.QcIssues);
                }
            );
        }

        [Fact]
        public async Task MinDataQc_Depth_IsNotValid()
        {

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD, isLogDataWithIssues: true, true);

            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.0, 2.9, null);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            var result = await _worker.Execute(job);

            Assert.Null(jobInfo.Report);
            Assert.Equal("Density not set.", result.WorkerResult.Message);
            Assert.False(result.WorkerResult.IsSuccess);


            job = GetMinimumDataQcJob(new LogObject(), [], 0.7, 2.9, null);
            jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            result = await _worker.Execute(job);

            Assert.Null(jobInfo.Report);
            Assert.Equal("Job contains no mnemonics.", result.WorkerResult.Message);
            Assert.False(result.WorkerResult.IsSuccess);


            job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, 0.0, null);
            jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            result = await _worker.Execute(job);

            Assert.Null(jobInfo.Report);
            Assert.Equal("At least one of DepthGap or TimeGap must be set or greater then 0.", result.WorkerResult.Message);
            Assert.False(result.WorkerResult.IsSuccess);


            job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, null, 2);
            jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            result = await _worker.Execute(job);

            Assert.Null(jobInfo.Report);
            Assert.Equal("Depth gap is 0 or not set.", result.WorkerResult.Message);
            Assert.False(result.WorkerResult.IsSuccess);


            job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, 2.9, null, "53", "51");
            jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            var ex = await Record.ExceptionAsync(() => _worker.Execute(job));

            Assert.NotNull(ex);
            Assert.IsType<DataException>(ex);
            Assert.Equal($"Wrong index order - log direction: {WitsmlLog.WITSML_DIRECTION_INCREASING}, start index: 53 m, end index: 51 m", ex.Message);
        }

        [Fact]
        public async Task MinDataQc_Time_IsNotValid()
        {
            var job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 3000.0, 1.0, null);
            var jobInfo = new JobInfo();
            job.JobInfo = jobInfo;

            SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME, isLogDataWithIssues: true, true);
            var result = await _worker.Execute(job);

            Assert.Null(jobInfo.Report);
            Assert.Equal("Time gap is 0 or not set.", result.WorkerResult.Message);
            Assert.False(result.WorkerResult.IsSuccess);


            job = GetMinimumDataQcJob(new LogObject(), ["BPOS", "SPM1", "SPM2"], 0.7, null, 2, "2023-04-19T00:00:03Z", "2023-04-19T00:00:01Z");
            jobInfo = new JobInfo();
            job.JobInfo = jobInfo;


            var ex = await Record.ExceptionAsync(() => _worker.Execute(job));

            Assert.NotNull(ex);
            Assert.IsType<DataException>(ex);
            Assert.Equal($"Wrong index order - log direction: {WitsmlLog.WITSML_DIRECTION_INCREASING}, start index: 2023-04-19T00:00:03.000Z, end index: 2023-04-19T00:00:01.000Z", ex.Message);
        }

        private static void SetupClient(Mock<IWitsmlClient> witsmlClient, string indexType, bool isLogDataWithIssues, bool isIncreasing)
        {
            bool isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
            var mockSequence = new MockSequence();

            var logDataWithGaps = GetTestLogDataWithGaps(isDepthLog);
            var logDataWithoutGaps = GetTestLogDataWithoutGaps(isDepthLog);
            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) => isLogDataWithIssues
                    ? Task.FromResult(GetTestWitsmlLogs(logDataWithGaps, isDepthLog, isIncreasing))
                    : Task.FromResult(GetTestWitsmlLogs(logDataWithoutGaps, isDepthLog, isIncreasing)));

            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) => isLogDataWithIssues
                    ? Task.FromResult(GetTestWitsmlLogs(logDataWithGaps, isDepthLog, isIncreasing))
                    : Task.FromResult(GetTestWitsmlLogs(logDataWithoutGaps, isDepthLog, isIncreasing)));

            witsmlClient.InSequence(mockSequence)
                .Setup(client =>
                    client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
                .Returns(Task.FromResult(new WitsmlLogs() { Logs = new List<WitsmlLog>() }));
        }

        private static WitsmlLogs GetTestWitsmlLogs(WitsmlLogData logData, bool isDepthLog, bool isIncreasing)
        {
            logData.Data = isIncreasing
                ? logData.Data.OrderBy(x => x.Data).ToList()
                : logData.Data.OrderByDescending(x => x.Data).ToList();

            (int minIndex, int maxIndex) = (51, 56);
            (string minDateTimeIndex, string maxDateTimeIndex) = ("2023-04-19T00:00:00Z", "2023-04-19T00:00:05Z");

            (int startIndex, int endIndex) = isIncreasing ? (minIndex, maxIndex) : (maxIndex, minIndex);
            (string startDateTimeIndex, string endDateTimeIndex) = isIncreasing ? (minDateTimeIndex, maxDateTimeIndex) : (maxDateTimeIndex, minDateTimeIndex);

            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid,
                    StartIndex = new WitsmlIndex(new DepthIndex(startIndex, CommonConstants.Unit.Meter)),
                    EndIndex = new WitsmlIndex(new DepthIndex(endIndex, CommonConstants.Unit.Meter)),
                    StartDateTimeIndex = startDateTimeIndex,
                    EndDateTimeIndex = endDateTimeIndex,
                    IndexCurve = new WitsmlIndexCurve() { Value = isDepthLog ? "Depth" : "Time" },
                    LogData = logData,
                    Direction = isIncreasing ? WitsmlLog.WITSML_DIRECTION_INCREASING : WitsmlLog.WITSML_DIRECTION_DECREASING,
                    IndexType = isDepthLog ? WitsmlLog.WITSML_INDEX_TYPE_MD : WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                {
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = isDepthLog ? "Depth" : "Time",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex,
                    },
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "BPOS",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex
                    },
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "SPM1",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex
                    },
                    new WitsmlLogCurveInfo()
                    {
                        Mnemonic = "SPM2",
                        MinIndex = new WitsmlIndex(new DepthIndex(minIndex, CommonConstants.Unit.Meter)),
                        MaxIndex = new WitsmlIndex(new DepthIndex(maxIndex, CommonConstants.Unit.Meter)),
                        MinDateTimeIndex = minDateTimeIndex,
                        MaxDateTimeIndex = maxDateTimeIndex
                    },
                },
                }.AsItemInList()
            };
        }

        private static WitsmlLogData GetTestLogDataWithoutGaps(bool isDepthLog)
        {
            return new WitsmlLogData()
            {
                MnemonicList = isDepthLog ? DepthMnemonicList : TimeMnemonicList,
                Data = new List<WitsmlData>()
            {
                new() { Data = isDepthLog ? DepthDataRow1 : TimeDataRow1 },
                new() { Data = isDepthLog ? DepthDataRow2 : TimeDataRow2 },
                new() { Data = isDepthLog ? DepthDataRow3 : TimeDataRow3 },
                new() { Data = isDepthLog ? DepthDataRow4 : TimeDataRow4 },
                new() { Data = isDepthLog ? DepthDataRow5 : TimeDataRow5 }
            }
            };
        }

        private static WitsmlLogData GetTestLogDataWithGaps(bool isDepthLog)
        {
            return new WitsmlLogData()
            {
                MnemonicList = isDepthLog ? DepthMnemonicList : TimeMnemonicList,
                Data = new List<WitsmlData>()
            {
                new() { Data = isDepthLog ? DepthDataWithIssuesRow1 : TimeDataWithIssuesRow1 },
                new() { Data = isDepthLog ? DepthDataWithIssuesRow2 : TimeDataWithIssuesRow2 },
                new() { Data = isDepthLog ? DepthDataWithIssuesRow3 : TimeDataWithIssuesRow3 },
                new() { Data = isDepthLog ? DepthDataWithIssuesRow4 : TimeDataWithIssuesRow4 },
                new() { Data = isDepthLog ? DepthDataWithIssuesRow5 : TimeDataWithIssuesRow5 },
                new() { Data = isDepthLog ? DepthDataWithIssuesRow6 : TimeDataWithIssuesRow6 }
            }
            };
        }

        private static MinimumDataQcJob GetMinimumDataQcJob(LogObject logObject, ICollection<string> mnemonics, double Density, double? DepthGap, long? TimeGap, string startIndex = "", string endIndex = "")
        {
            return new MinimumDataQcJob
            {
                LogReference = logObject,
                StartIndex = startIndex,
                EndIndex = endIndex,
                Mnemonics = mnemonics,
                Density = Density,
                DepthGap = DepthGap,
                TimeGap = TimeGap,
            };
        }
    }
}
