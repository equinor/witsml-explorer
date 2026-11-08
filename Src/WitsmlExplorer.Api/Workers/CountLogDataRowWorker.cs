using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers;

public interface ICountLogDataRowWorker
{
    Task<(WorkerResult, RefreshAction)> Execute(CountLogDataRowJob job,
        CancellationToken? cancellationToken = null);
}

/// <summary>
/// Worker for counting how many values are in each curve.
/// </summary>
public class CountLogDataRowWorker : BaseWorker<CountLogDataRowJob>, IWorker, ICountLogDataRowWorker
{
    public JobType JobType => JobType.CountLogDataRows;
    public CountLogDataRowWorker(ILogger<CountLogDataRowJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

    /// <summary>
    /// Counts the number of log data rows in all curves and generates a report.
    /// </summary>
    /// <param name="job">The job model contains job-specific parameters.</param>
    /// <returns>Task of the workerResult in a report with a mnemonic name and number of rows.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(CountLogDataRowJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Counting log data rows started. {jobDescription}", job.Description());
        if (job.JobInfo == null)
        {
            job.JobInfo = new JobInfo();
        }
        string indexCurve = job.LogReference.IndexCurve;
        string logUid = job.LogReference.Uid;
        bool isDepthLog = job.LogReference.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
        List<CountLogDataReportItem> countLogDataReportItems = new();

        var witsmlLog = await LogWorkerTools.GetLog(job.UseTargetClient ? GetTargetWitsmlClientOrThrow() : GetSourceWitsmlClientOrThrow(), job.LogReference, ReturnElements.HeaderOnly);
        cancellationToken?.ThrowIfCancellationRequested();
        if (witsmlLog == null)
        {
            var message = $"CountLogDataRowWorkerJob failed. Cannot find the witsml log for {job.Description()}";
            Logger.LogError(message);
            return (new WorkerResult(job.UseTargetClient ? GetTargetWitsmlClientOrThrow().GetServerHostname() : GetSourceWitsmlClientOrThrow().GetServerHostname(), false, message), null);
        }

        var logMnemonicsQuery = witsmlLog.LogCurveInfo.Where(x => x.Mnemonic != indexCurve).Select(x => x.Mnemonic);
        if (job.Mnemonics != null && job.Mnemonics.Any())
        {
            logMnemonicsQuery = logMnemonicsQuery.Where(m => job.Mnemonics.Any(req => string.Equals(req, m, StringComparison.OrdinalIgnoreCase)));
        }
        var logMnemonics = logMnemonicsQuery.ToList();
        var startIndex = Index.Start(witsmlLog, job.StartIndex);
        var endIndex = Index.End(witsmlLog, job.EndIndex);
        double samplingInterval = job.SamplingInterval ?? 0;
        var totalEstimatedDuration = logMnemonics.Count;
        var currentElapsedDuration = 0;
        var countLogDataReportItemTasks = logMnemonics.Select(async mnemonic =>
        {
            int mnemonicLogDataRowsCount = 0;
            double? lastDepthIndex = null;
            DateTime? lastTimeIndex = null;

            await using LogDataReader logDataReader = new(job.UseTargetClient ? GetTargetWitsmlClientOrThrow() : GetSourceWitsmlClientOrThrow(), witsmlLog, new List<string>() { mnemonic }, Logger, startIndex, endIndex);
            WitsmlLogData logData = await logDataReader.GetNextBatch();
            while (logData != null)
            {
                cancellationToken?.ThrowIfCancellationRequested();
                if (samplingInterval > 0 && logData.Data != null)
                {
                    foreach (var row in logData.Data)
                    {
                        string indexStr = row.Data?.Split(CommonConstants.DataSeparator).FirstOrDefault();
                        if (string.IsNullOrEmpty(indexStr)) continue;

                        if (isDepthLog)
                        {
                            if (double.TryParse(indexStr, NumberStyles.Float, CultureInfo.InvariantCulture, out double currentDepth))
                            {
                                if (!lastDepthIndex.HasValue || Math.Abs(currentDepth - lastDepthIndex.Value) >= samplingInterval - 1e-6)
                                {
                                    mnemonicLogDataRowsCount++;
                                    lastDepthIndex = currentDepth;
                                }
                            }
                        }
                        else
                        {
                            if (DateTime.TryParse(indexStr, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out DateTime currentTime))
                            {
                                if (!lastTimeIndex.HasValue || Math.Abs((currentTime - lastTimeIndex.Value).TotalSeconds) >= samplingInterval - 1e-3)
                                {
                                    mnemonicLogDataRowsCount++;
                                    lastTimeIndex = currentTime;
                                }
                            }
                        }
                    }
                }
                else
                {
                    mnemonicLogDataRowsCount += logData.Data?.Count ?? 0;
                }
                logData = await logDataReader.GetNextBatch();
            }

            var progress = (double)Interlocked.Increment(ref currentElapsedDuration) / totalEstimatedDuration;

            job.ProgressReporter?.Report(progress);
            if (job.JobInfo != null) job.JobInfo.Progress = progress;

            return new CountLogDataReportItem() { Mnemonic = mnemonic, LogDataCount = mnemonicLogDataRowsCount };
        }).ToList();
        countLogDataReportItems.AddRange(await Task.WhenAll(countLogDataReportItemTasks));

        return GetCountLogDataReportResult(job, countLogDataReportItems, isDepthLog, logUid);
    }

    private (WorkerResult, RefreshAction) GetCountLogDataReportResult(CountLogDataRowJob job, IList<CountLogDataReportItem> reportItems, bool isDepth, string logUid)
    {
        Logger.LogInformation("Counting log data rows is done. {jobDescription}", job.Description());
        job.JobInfo.Report = GetCountLogDataReport(reportItems, job.LogReference, isDepth);
        WorkerResult workerResult = new(job.UseTargetClient ? GetTargetWitsmlClientOrThrow().GetServerHostname() : GetSourceWitsmlClientOrThrow().GetServerHostname(), true, $"Count data rows for the log: {logUid}", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private CountLogDataReport GetCountLogDataReport(IList<CountLogDataReportItem> reportItems, LogObject logReference, bool isDepthLog)
    {
        var totalCount = reportItems.Sum(x => x.LogDataCount);
        return new CountLogDataReport
        {
            Title = $"Count log data values report - {logReference.Name}",
            Summary = reportItems.Count > 0
                ? $"Found a total of {totalCount} values in the {(isDepthLog ? "depth" : "time")} log '{logReference.Name}':"
                : "No curve values found.",
            LogReference = logReference,
            ReportItemColumns = new List<ReportItemColumn> { new() { Name = "logdatacount", Type = ReportItemType.NUMBER } },
            ReportItems = reportItems
        };
    }
}
