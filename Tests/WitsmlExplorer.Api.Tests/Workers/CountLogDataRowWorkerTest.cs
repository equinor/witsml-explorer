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
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers;

/// <summary>
/// Unit tests for the CountLogDataRowWorker class.
/// </summary>
public class CountLogDataRowWorkerTest
{
    private const string LogUid = "logUid";
    private const string IndexCurveDepth = "Depth";
    private const string IndexCurveTime = "Time";
    private const string WellUid = "wellUid";
    private const string WellboreUid = "wellboreUid";
    private const string MnemonicList = "Depth,BPOS";

    private readonly Mock<IWitsmlClient> _witsmlClient;
    private readonly CountLogDataRowWorker _worker;

    public CountLogDataRowWorkerTest()
    {
        Mock<IWitsmlClientProvider> witsmlClientProvider = new();
        _witsmlClient = new Mock<IWitsmlClient>();
        witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        ILoggerFactory loggerFactory = new LoggerFactory();
        loggerFactory.AddSerilog(Log.Logger);
        ILogger<CountLogDataRowJob> logger = loggerFactory.CreateLogger<CountLogDataRowJob>();
        _worker = new CountLogDataRowWorker(logger, witsmlClientProvider.Object);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public async Task CountLogDataRow_Depth_Execute_ValidResults(int numberOfData)
    {
        CountLogDataRowJob job = GetJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD, numberOfData);
        (_, _) = await _worker.Execute(job);

        Assert.IsType<CountLogDataReport>(jobInfo.Report);
        CountLogDataReport report = (CountLogDataReport)jobInfo.Report;
        Assert.Equal(LogUid, report.LogReference.Uid);
        Assert.Equal(WellUid, report.LogReference.WellUid);
        Assert.Equal(WellboreUid, report.LogReference.WellboreUid);
        Assert.NotEmpty(report.ReportItems);
        Assert.Equal(numberOfData, (((CountLogDataReportItem)report.ReportItems.FirstOrDefault())?.LogDataCount));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(4)]
    [InlineData(9)]
    public async Task CountLogDataRow_Time_Execute_ValidResults(int numberOfData)
    {
        CountLogDataRowJob job = GetJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        SetupClient(_witsmlClient, WitsmlLog.WITSML_INDEX_TYPE_MD, numberOfData);
        (_, _) = await _worker.Execute(job);

        Assert.IsType<CountLogDataReport>(jobInfo.Report);
        CountLogDataReport report = (CountLogDataReport)jobInfo.Report;
        Assert.Equal(LogUid, report.LogReference.Uid);
        Assert.Equal(WellUid, report.LogReference.WellUid);
        Assert.Equal(WellboreUid, report.LogReference.WellboreUid);
        Assert.NotEmpty(report.ReportItems);
        Assert.Equal(numberOfData, (((CountLogDataReportItem)report.ReportItems.FirstOrDefault())?.LogDataCount));
    }

    [Fact]
    public async Task CountLogDataRow_Execute_Error_NoData()
    {
        CountLogDataRowJob job = GetJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;
        bool isSuccess = false;

        _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) => Task.FromResult(new WitsmlLogs()));

        (WorkerResult Result, RefreshAction) countLogDataRowTask = await _worker.Execute(job);
        Assert.Equal(isSuccess, countLogDataRowTask.Result.IsSuccess);
    }

    [Fact]
    public async Task CountLogDataRow_Execute_NoMnemonics()
    {
        var expectedSummary = "No curve values found.";
        CountLogDataRowJob job = GetJobTemplate(WitsmlLog.WITSML_INDEX_TYPE_MD);
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) => Task.FromResult(GetTestWitsmlLogs(null, true, emptyLogCurveInfo: true)));

        (WorkerResult Result, RefreshAction) countLogDataRowTask = await _worker.Execute(job);
        CountLogDataReport report = (CountLogDataReport)jobInfo.Report;

        Assert.Empty(report.ReportItems);
        Assert.Equal(expectedSummary, report.Summary);
    }


    private static void SetupClient(Mock<IWitsmlClient> witsmlClient, string indexType, int numberOfData)
    {
        bool isDepthLog = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
        var mockSequence = new MockSequence();

        witsmlClient.InSequence(mockSequence)
            .Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) =>
                Task.FromResult(GetTestWitsmlLogs(GetTestLogData(isDepthLog, numberOfData), isDepthLog)));

        witsmlClient.InSequence(mockSequence)
            .Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns((WitsmlLogs _, OptionsIn _, CancellationToken? _) =>
                Task.FromResult(GetTestWitsmlLogs(GetTestLogData(isDepthLog, numberOfData), isDepthLog)));

        witsmlClient.InSequence(mockSequence)
            .Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns(Task.FromResult(new WitsmlLogs() { Logs = new List<WitsmlLog>() }));
    }

    private static WitsmlLogs GetTestWitsmlLogs(WitsmlLogData logData, bool isDepthLog, bool emptyLogCurveInfo = false)
    {
        (string minDateTimeIndex, string maxDateTimeIndex) = ("2023-04-19T00:00:00Z", "2023-04-19T00:00:10Z");
        (int minIndex, int maxIndex) = (51, 60);
        (int startIndex, int endIndex) = (minIndex, maxIndex);
        (string startDateTimeIndex, string endDateTimeIndex) = (minDateTimeIndex, maxDateTimeIndex);

        var logCurveInfo = new List<WitsmlLogCurveInfo>() { new() { Mnemonic = isDepthLog ? IndexCurveDepth : IndexCurveTime } };
        if (!emptyLogCurveInfo)
        {
            logCurveInfo.Add(new WitsmlLogCurveInfo() { Mnemonic = "BPOS" });
        }

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
                IndexCurve = new WitsmlIndexCurve() { Value = isDepthLog ? IndexCurveDepth : IndexCurveTime },
                LogData = logData,
                IndexType = isDepthLog ? WitsmlLog.WITSML_INDEX_TYPE_MD : WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME,
                LogCurveInfo = logCurveInfo,
            }.AsItemInList()
        };
    }

    private static WitsmlLogData GetTestLogData(bool isDepthLog, int numberOfData)
    {
        List<WitsmlData> data;

        if (isDepthLog)
        {
            data = new List<WitsmlData>()
            {
                new() { Data = "51,101" },
                new() { Data = "52,102" },
                new() { Data = "53,103" },
                new() { Data = "54,104" },
                new() { Data = "55,105" },
                new() { Data = "56,106" },
                new() { Data = "57,107" },
                new() { Data = "58,108" },
                new() { Data = "59,109" },
                new() { Data = "60,110" }
            };
        }
        else
        {
            data = new List<WitsmlData>()
            {
                new() { Data = "2023-04-19T00:00:00Z,101" },
                new() { Data = "2023-04-19T00:00:01Z,102" },
                new() { Data = "2023-04-19T00:00:02Z,103" },
                new() { Data = "2023-04-19T00:00:03Z,104" },
                new() { Data = "2023-04-19T00:00:04Z,105" },
                new() { Data = "2023-04-19T00:00:05Z,106" },
                new() { Data = "2023-04-19T00:00:07Z,107" },
                new() { Data = "2023-04-19T00:00:08Z,108" },
                new() { Data = "2023-04-19T00:00:09Z,109" },
                new() { Data = "2023-04-19T00:00:10Z,110" },
            };
        }

        return new WitsmlLogData() { MnemonicList = MnemonicList, Data = data.Take(numberOfData).ToList() };
    }

    private static CountLogDataRowJob GetJobTemplate(string indexType)
    {
        return new CountLogDataRowJob
        {
            LogReference = new LogObject()
            {
                Uid = LogUid,
                WellUid = WellUid,
                WellboreUid = WellboreUid,
                IndexCurve = indexType == WitsmlLog.WITSML_INDEX_TYPE_MD ? IndexCurveDepth : IndexCurveTime,
                IndexType = indexType
            }
        };
    }
}
