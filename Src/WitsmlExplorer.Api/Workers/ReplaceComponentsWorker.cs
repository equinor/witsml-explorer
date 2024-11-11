using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceComponentsWorker : BaseWorker<ReplaceComponentsJob>, IWorker
    {
        private readonly ICopyComponentsWorker _copyWorker;
        private readonly IDeleteComponentsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceComponents;

        public ReplaceComponentsWorker(ILogger<ReplaceComponentsJob> logger, ICopyComponentsWorker copyWorker, IDeleteComponentsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceComponentsJob job, CancellationToken? cancellationToken = null)
        {
            List<CommonCopyReportItem> replaceComponentReportItems = new();
            (WorkerResult WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob, cancellationToken);

            replaceComponentReportItems.Add(new CommonCopyReportItem
            {
                Phase = "Deleted Components",
                Message = result.WorkerResult.Message,
                Status = GetJobStatus(result.WorkerResult.IsSuccess, cancellationToken)
            });
            if (!result.WorkerResult.IsSuccess)
            {
                return result;
            }

            job.CopyJob.ProgressReporter = new Progress<double>(progress =>
                {
                    job.ProgressReporter?.Report(progress);
                    if (job.JobInfo != null) job.JobInfo.Progress = progress;
                }
            );

            var copyResult = await _copyWorker.Execute(job.CopyJob, cancellationToken);
            replaceComponentReportItems.Add(new CommonCopyReportItem
            {
                Phase = "Replaced Components",
                Message = copyResult.Item1.Reason,
                Status = GetJobStatus(copyResult.Item1.IsSuccess, cancellationToken)
            });
            job.JobInfo.Report = CreateReplaceComponentReport(replaceComponentReportItems);
            return copyResult;
        }

        private CommonCopyReport CreateReplaceComponentReport(List<CommonCopyReportItem> reportItems)
        {
            return new CommonCopyReport
            {
                Title = $"Replace component report",
                Summary = "Replace component report",
                ReportItems = reportItems
            };
        }
    }
}
