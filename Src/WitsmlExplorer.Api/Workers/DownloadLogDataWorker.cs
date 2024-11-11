using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers;

/// <summary>
/// Worker for downloading log data.
/// </summary>
public class DownloadLogDataWorker : BaseWorker<DownloadLogDataJob>, IWorker
{
    public JobType JobType => JobType.DownloadLogData;
    private readonly ILogObjectService _logObjectService;
    private readonly char _newLineCharacter = '\n';
    private readonly char _separator = ',';

    public DownloadLogDataWorker(
            ILogger<DownloadLogDataJob> logger,
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
    public override async Task<(WorkerResult, RefreshAction)> Execute(DownloadLogDataJob job, CancellationToken? cancellationToken = null)
    {
        Logger.LogInformation("Downloading of all data started. {jobDescription}", job.Description());
        IProgress<double> progressReporter = new Progress<double>(progress =>
        {
            job.ProgressReporter?.Report(progress);
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
        });

        if (!string.IsNullOrEmpty(job.StartIndex))
        {
            job.LogReference.StartIndex = job.StartIndex;
        }

        if (!string.IsNullOrEmpty(job.EndIndex))
        {
            job.LogReference.EndIndex = job.EndIndex;
        }

        var logData = await _logObjectService.ReadLogData(job.LogReference.WellUid, job.LogReference.WellboreUid, job.LogReference.Uid, job.Mnemonics.ToList(), job.StartIndexIsInclusive, job.LogReference.StartIndex, job.LogReference.EndIndex, true, cancellationToken, progressReporter);

        return DownloadLogDataResult(job, logData.Data, logData.CurveSpecifications);
    }

    private (WorkerResult, RefreshAction) DownloadLogDataResult(DownloadLogDataJob job, ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        Logger.LogInformation("Download of all data is done. {jobDescription}", job.Description());
        string content = GetCsvFileContent(reportItems, curveSpecifications);
        job.JobInfo.Report = DownloadLogDataReport(job.LogReference, content, "csv");
        WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Download of all data is ready, jobId: ", jobId: job.JobInfo.Id);
        return (workerResult, null);
    }

    private DownloadLogDataReport DownloadLogDataReport(LogObject logReference, string fileContent, string fileExtension)
    {
        return new DownloadLogDataReport
        {
            Title = $"{logReference.WellboreName} - {logReference.Name}",
            Summary = "The download will start automatically. You can also access the download link in the Jobs view.",
            LogReference = logReference,
            HasFile = true,
            FileData = new ReportFileData
            {
                FileName = $"{logReference.WellboreName}-{logReference.Name}.{fileExtension}",
                FileContent = fileContent
            }
        };
    }

    private string GetCsvFileContent(ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        return $"{GetReportHeader(curveSpecifications)}\n{GetReportBody(reportItems, curveSpecifications)}";
    }

    private string GetReportHeader(ICollection<CurveSpecification> curveSpecifications)
    {
        var listOfHeaders = new List<string>();
        foreach (CurveSpecification curveSpec in curveSpecifications)
        {
            listOfHeaders.Add($"{curveSpec.Mnemonic}[{curveSpec.Unit}]");
        }
        return string.Join(',', listOfHeaders);
    }

    private string GetReportBody(ICollection<Dictionary<string, LogDataValue>> reportItems, ICollection<CurveSpecification> curveSpecifications)
    {
        var mnemonics = curveSpecifications.Select(spec => spec.Mnemonic).ToList();
        var body = string.Join(_newLineCharacter,
            reportItems.Select(row =>
                string.Join(_separator, mnemonics.Select(mnemonic =>
                    row.TryGetValue(mnemonic, out LogDataValue value)
                    ? value.Value.ToString()
                    : string.Empty
                ))
            )
        );
        return body;
    }
}
