using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for downloading all log data.
/// </summary>
public class DownloadAllLogDataWorker : BaseWorker<DownloadAllLogDataJob>, IWorker
{
    public JobType JobType => JobType.DownloadAllLogData;
    private readonly ILogObjectService _logObjectService;

    public DownloadAllLogDataWorker(
            ILogger<DownloadAllLogDataJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            ILogObjectService logObjectService)
            : base(witsmlClientProvider, logger)
    {
        _logObjectService = logObjectService;
    }
    /// <summary>
    /// Downaloads all log data and generates a report.
    /// </summary>
    /// <param name="job">The job model contains job-specific parameters.</param>
    /// <returns>Task of the workerResult in a report with all log data.</returns>
    public override async Task<(WorkerResult, RefreshAction)> Execute(DownloadAllLogDataJob job)
    {
        Logger.LogInformation("Downloading of all data started. {jobDescription}", job.Description());
        var logData = await _logObjectService.ReadLogData(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid, job.Mnemonics.ToList(), job.StartIndexIsInclusive, job.LogReference.StartIndex, job.LogReference.EndIndex, true);        
        return DownloadAllLogDataResult(job, logData.Data, job.LogReference.Uid);
    }


    private (WorkerResult, RefreshAction) DownloadAllLogDataResult(DownloadAllLogDataJob job, ICollection<Dictionary<string, LogDataValue>>  reportItems, string logUid)
    {
        Logger.LogInformation("Download of all data is done. {jobDescription}", job.Description());
        job.JobInfo.Report = DownloadAllLogDataReport(reportItems, job.LogReference);
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Download of all data is ready, jobId: ", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private DownloadAllLogDataReport DownloadAllLogDataReport(ICollection<Dictionary<string, LogDataValue>> reportItems, LogObject logReference)
    {       
        return new DownloadAllLogDataReport
        {
            Title = $"{logReference.WellboreName} - {logReference.Name}",
            Summary = "You can download the report as csv file",
            LogReference = logReference,
            ReportItems = reportItems,
            DownloadImmediately= true
        };
    }
}
