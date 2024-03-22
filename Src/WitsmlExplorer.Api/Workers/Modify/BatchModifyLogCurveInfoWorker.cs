using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify;

/// <summary>
/// Worker for batch modification of LogCurveInfo.
/// </summary>
public class BatchModifyLogCurveInfoWorker : BaseWorker<BatchModifyLogCurveInfoJob>, IWorker
{
    public JobType JobType => JobType.BatchModifyLogCurveInfo;

    public BatchModifyLogCurveInfoWorker(ILogger<BatchModifyLogCurveInfoJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

    /// <summary>
    /// Executes a batch modification job for LogCurveInfoItem properties.
    /// </summary>
    /// <param name="job">The job model contains batch modification parameters for logCurveInfo.</param>
    /// <returns>Task of the worker Result in a report with a result of batch modification.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyLogCurveInfoJob job, CancellationToken? cancellationToken = null)
    {
        Verify(job);

        Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

        WitsmlLogs logHeaders = await GetLogHeaders(job.WellboreReference.WellUid, job.WellboreReference.WellboreUid, job.LogCurveInfoBatchItems.Select(x => x.LogUid).Distinct().ToArray());

        IList<(string logUid, WitsmlLogCurveInfo logCurveInfo)> originalLogCurveInfoData = job.LogCurveInfoBatchItems
            .SelectMany(batchItem =>
            {
                WitsmlLog logHeader = logHeaders.Logs.Find(l => l.Uid == batchItem.LogUid);
                var curveInfo = logHeader?.LogCurveInfo.FirstOrDefault(c => c.Uid == batchItem.LogCurveInfoUid);
                return curveInfo != null ? new[] { (logHeader.Uid, curveInfo) } : Array.Empty<(string, WitsmlLogCurveInfo)>();
            })
            .ToList();

        IList<WitsmlLogs> logCurveInfosToUpdateQueries = originalLogCurveInfoData
            .Select(obj => GetModifyLogCurveInfoQuery(job, obj)).ToList();
        List<QueryResult> modifyResults = logCurveInfosToUpdateQueries
            .Select(async query => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query))
            .Select(updateTask => updateTask.Result).ToList();

        var report = CreateReport(job, originalLogCurveInfoData, modifyResults);
        job.JobInfo.Report = report;

        if (modifyResults.Any(result => !result.IsSuccessful))
        {
            string errorMessage = $"Failed to modify some LogCurveInfos";
            var reason = "Inspect the report for details";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, reason, null, job.JobInfo.Id), null);
        }

        Logger.LogInformation("{JobType} - Job successful", GetType().Name);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"The LogCurveInfo properties have been updated in the batch.", jobId: job.JobInfo.Id);
        RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.WellboreReference.WellUid, job.WellboreReference.WellboreUid, EntityType.Log);
        return (workerResult, refreshAction);
    }

    private BatchModifyLogCurveInfoReport CreateReport(BatchModifyLogCurveInfoJob job, IList<(string logUid, WitsmlLogCurveInfo logCurveInfo)> logCurveInfoData, IList<QueryResult> results)
    {
        var reportItems = logCurveInfoData.Select((obj, index) => new BatchModifyLogCurveInfoReportItem
        {
            WellUid = job.WellboreReference.WellUid,
            WellboreUid = job.WellboreReference.WellboreUid,
            LogUid = obj.logUid,
            Uid = obj.logCurveInfo.Uid,
            IsSuccessful = results[index].IsSuccessful ? CommonConstants.Yes : CommonConstants.No,
            FailureReason = results[index].IsSuccessful ? string.Empty : results[index].Reason
        }).ToList();

        return new BatchModifyLogCurveInfoReport()
        {
            Title = "Batch Update LogCurveInfo Report",
            Summary = $"Updated {logCurveInfoData.Count} objects",
            WarningMessage = results.Any(result => !result.IsSuccessful) ? "Some logCurveInfos were not modified. Inspect the reasons below." : null,
            ReportItems = reportItems
        };
    }

    private WitsmlLogs GetModifyLogCurveInfoQuery(BatchModifyLogCurveInfoJob job, (string logUid, WitsmlLogCurveInfo logCurveInfo) originalLogCurveInfoData)
    {
        if (!string.IsNullOrEmpty(job.EditedLogCurveInfo.TraceState))
        {
            originalLogCurveInfoData.logCurveInfo.TraceState = job.EditedLogCurveInfo.TraceState;
        }

        originalLogCurveInfoData.logCurveInfo.SensorOffset = job.EditedLogCurveInfo.SensorOffset?.ToWitsml<WitsmlLengthMeasure>();

        if (!string.IsNullOrEmpty(job.EditedLogCurveInfo.NullValue))
        {
            originalLogCurveInfoData.logCurveInfo.NullValue = job.EditedLogCurveInfo.NullValue;
        }

        return new()
        {
            Logs = new List<WitsmlLog>
            {
                new()
                {
                    UidWell = job.WellboreReference.WellUid,
                    UidWellbore = job.WellboreReference.WellboreUid,
                    Uid = originalLogCurveInfoData.logUid,
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                    {
                        originalLogCurveInfoData.logCurveInfo
                    }
                }
            }
        };
    }

    private async Task<WitsmlLogs> GetLogHeaders(string wellUid, string wellboreUid, string[] logUids)
    {
        return await LogWorkerTools.GetLogsByIds(GetTargetWitsmlClientOrThrow(), wellUid, wellboreUid, logUids, ReturnElements.HeaderOnly);
    }

    private void Verify(BatchModifyLogCurveInfoJob job)
    {
        if (!job.LogCurveInfoBatchItems.Any())
        {
            throw new InvalidOperationException("LogCurveInfoBatchItems must be specified");
        }

        if (string.IsNullOrEmpty(job.WellboreReference.WellUid))
        {
            throw new InvalidOperationException("WellUid cannot be empty");
        }

        if (string.IsNullOrEmpty(job.WellboreReference.WellboreUid))
        {
            throw new InvalidOperationException("WellboreUid cannot be empty");
        }

        ModifyUtils.VerifyMeasure(job.EditedLogCurveInfo.SensorOffset, nameof(job.EditedLogCurveInfo.SensorOffset));
        ModifyUtils.VerifyAllowedValues(job.EditedLogCurveInfo.TraceState, EnumHelper.GetEnumDescriptions<LogTraceState>(), nameof(job.EditedLogCurveInfo.TraceState));
    }
}
