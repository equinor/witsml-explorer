using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for counting how many values are in each curve.
/// </summary>
public class CountLogDataRowWorker : BaseWorker<CountLogDataRowJob>, IWorker
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

        string indexCurve = job.LogReference.IndexCurve;
        string logUid = job.LogReference.Uid;
        bool isDepthLog = job.LogReference.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
        List<CountLogDataReportItem> countLogDataReportItems = new();

        var witsmlLog = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), job.LogReference, ReturnElements.HeaderOnly);
        if (witsmlLog == null)
        {
            var message = $"CountLogDataRowWorkerJob failed. Cannot find the witsml log for {job.Description()}";
            Logger.LogError(message);
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
        }

        var logMnemonics = witsmlLog.LogCurveInfo.Where(x => x.Mnemonic != indexCurve).Select(x => x.Mnemonic).ToList();

        var countLogDataReportItemTasks = logMnemonics.Select(async mnemonic =>
        {
            int mnemonicLogDataRowsCount = 0;
            await using LogDataReader logDataReader = new(GetTargetWitsmlClientOrThrow(), witsmlLog, new List<string>() { mnemonic }, Logger);
            WitsmlLogData logData = await logDataReader.GetNextBatch();
            while (logData != null)
            {
                mnemonicLogDataRowsCount += logData.Data?.Count ?? 0;
                logData = await logDataReader.GetNextBatch();
            }

            return new CountLogDataReportItem() { Mnemonic = mnemonic, LogDataCount = mnemonicLogDataRowsCount };
        }).ToList();
        countLogDataReportItems.AddRange(await Task.WhenAll(countLogDataReportItemTasks));

        return GetCountLogDataReportResult(job, countLogDataReportItems, isDepthLog, logUid);
    }

    private (WorkerResult, RefreshAction) GetCountLogDataReportResult(CountLogDataRowJob job, IList<CountLogDataReportItem> reportItems, bool isDepth, string logUid)
    {
        Logger.LogInformation("Counting log data rows is done. {jobDescription}", job.Description());
        job.JobInfo.Report = GetCountLogDataReport(reportItems, job.LogReference, isDepth);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Count data rows for the log: {logUid}", jobId: job.JobInfo.Id);
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
            ReportItems = reportItems
        };
    }
}
