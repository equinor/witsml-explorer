using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Moq;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Modify;

using Xunit;

namespace WitsmlExplorer.Api.Tests.Workers;

/// <summary>
/// Unit tests for the functionality of batch modifying log curve information.
/// </summary>
public class BatchModifyLogCurveInfoTests
{
    private readonly Mock<IWitsmlClient> _witsmlClient;
    private readonly BatchModifyLogCurveInfoWorker _worker;

    private const string WellUid = "wellUid";
    private const string WellboreUid = "wellboreUid";
    private const string LogUid1 = "logUid1";
    private const string LogUid2 = "logUid2";
    private const string LogUid3 = "logUid3";
    private const string LogCurveInfoUid1 = "LogCurveInfoUid1";
    private const string LogCurveInfoUid2 = "LogCurveInfoUid2";
    private const string LogCurveInfoUid3 = "LogCurveInfoUid3";
    private const string NullValue = "123";

    public BatchModifyLogCurveInfoTests()
    {
        Mock<IWitsmlClientProvider> witsmlClientProvider = new();
        _witsmlClient = new Mock<IWitsmlClient>();
        witsmlClientProvider.Setup(provider => provider.GetClient()).Returns(_witsmlClient.Object);
        ILoggerFactory loggerFactory = new LoggerFactory();
        loggerFactory.AddSerilog(Log.Logger);
        ILogger<BatchModifyLogCurveInfoJob> logger = loggerFactory.CreateLogger<BatchModifyLogCurveInfoJob>();
        _worker = new BatchModifyLogCurveInfoWorker(logger, witsmlClientProvider.Object);
    }

    [Fact]
    public async Task BatchModifyLogCurveInfo_CorrectData_IsValid()
    {
        BatchModifyLogCurveInfoJob job = GetJobTemplate();
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        _witsmlClient.Setup(client =>
                client.GetFromStoreAsync(It.IsAny<WitsmlLogs>(), It.IsAny<OptionsIn>(), null))
            .Returns(Task.FromResult(GetTestWitsmlLogs()));

        List<WitsmlLogs> updatedLogs = new();
        _witsmlClient.Setup(client =>
                client.UpdateInStoreAsync(It.IsAny<IWitsmlQueryType>())).Callback<IWitsmlQueryType>(logs => updatedLogs.Add(logs as WitsmlLogs))
            .ReturnsAsync(new QueryResult(true));

        (_, _) = await _worker.Execute(job);

        BatchModifyLogCurveInfoReport report = (BatchModifyLogCurveInfoReport)job.JobInfo.Report;
        IEnumerable<BatchModifyLogCurveInfoReportItem> reportItems = (IEnumerable<BatchModifyLogCurveInfoReportItem>)report.ReportItems;

        Assert.Equal(3, updatedLogs.Count);
        Assert.Equal(WellUid, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.UidWell);
        Assert.Equal(WellboreUid, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.UidWellbore);
        Assert.Equal(LogCurveInfoUid1, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.LogCurveInfo
                .FirstOrDefault()?.Uid);
        Assert.Equal(LogUid1, updatedLogs.FirstOrDefault()?.Logs.FirstOrDefault()?.Uid);
        Assert.Equal(LogCurveInfoUid3, updatedLogs.LastOrDefault()?.Logs.LastOrDefault()?.LogCurveInfo
                .LastOrDefault()?.Uid);
        Assert.Equal(LogUid3, updatedLogs.LastOrDefault()?.Logs.LastOrDefault()?.Uid);
        Assert.Equal(3, reportItems.Count());
        Assert.Equal(CommonConstants.Yes, reportItems.FirstOrDefault()?.IsSuccessful);
        Assert.Equal(CommonConstants.Yes, reportItems.LastOrDefault().IsSuccessful);
    }

    [Fact]
    public async Task BatchModifyLogCurveInfo_NoCurveInfoItems_InvalidOperationException()
    {
        BatchModifyLogCurveInfoJob job = GetJobTemplate(null, emptyLogCurveInfoItems: true);
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("LogCurveInfoBatchItems must be specified", exception.Message);
        _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
    }

    [Fact]
    public async Task BatchModifyLogCurveInfo_EmptyWellUid_InvalidOperationException()
    {
        BatchModifyLogCurveInfoJob job = GetJobTemplate();
        job.WellboreReference.WellUid = string.Empty;
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal("WellUid cannot be empty", exception.Message);
        _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
    }

    [Fact]
    public async Task BatchModifyLogCurveInfo_TraceState_InvalidOperationException()
    {
        BatchModifyLogCurveInfoJob job = GetJobTemplate("WrongTraceStateType");
        JobInfo jobInfo = new();
        job.JobInfo = jobInfo;

        InvalidOperationException exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _worker.Execute(job));
        Assert.Equal($"WrongTraceStateType is not an allowed value for TraceState", exception.Message);
        _witsmlClient.Verify(client => client.UpdateInStoreAsync(It.IsAny<WitsmlLogs>()), Times.Never);
    }

    private static WitsmlLogs GetTestWitsmlLogs()
    {
        return new WitsmlLogs
        {
            Logs = new List<WitsmlLog>()
            {
                new()
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid1,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                        {
                            new() { Uid = LogCurveInfoUid1 },
                        }
                },
                new()
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid2,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                        {
                            new() { Uid = LogCurveInfoUid2 },
                        }
                },
                new()
                {
                    UidWell = WellUid,
                    UidWellbore = WellboreUid,
                    Uid = LogUid3,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                    {
                        new() { Uid = LogCurveInfoUid3 },
                    }
                },
            }
        };
    }

    private static BatchModifyLogCurveInfoJob GetJobTemplate(
        string logTraceState = null, bool emptyLogCurveInfoItems = false)
    {
        var logCurveInfoBatchItems = new List<LogCurveInfoBatchItem>()
        {
            new() { LogUid = LogUid1, LogCurveInfoUid = LogCurveInfoUid1 },
            new() { LogUid = LogUid2, LogCurveInfoUid = LogCurveInfoUid2 },
            new() { LogUid = LogUid3, LogCurveInfoUid = LogCurveInfoUid3 }
        };

        return new BatchModifyLogCurveInfoJob()
        {
            WellboreReference = new WellboreReference()
            {
                WellUid = WellUid,
                WellboreUid = WellboreUid
            },
            EditedLogCurveInfo = new LogCurveInfo()
            {
                TraceState =
                    logTraceState ??
                    EnumHelper.GetEnumDescription(LogTraceState.Raw),
                SensorOffset = new LengthMeasure()
                {
                    Value = 22,
                    Uom = CommonConstants.Unit.Meter
                },
                NullValue = NullValue
            },
            LogCurveInfoBatchItems = emptyLogCurveInfoItems
                ? new List<LogCurveInfoBatchItem>()
                : logCurveInfoBatchItems
        };
    }
}
