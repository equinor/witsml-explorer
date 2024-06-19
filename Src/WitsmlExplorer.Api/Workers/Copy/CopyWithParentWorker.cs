using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyWithParentWorker : BaseWorker<CopyWithParentJob>, IWorker
    {
        private readonly ICopyWellWorker _copyWellWorker;
        private readonly ICopyWellboreWorker _copyWellboreWorker;
        private readonly ICopyObjectsWorker _copyObjectsWorker;

        public CopyWithParentWorker(
            ILogger<CopyWithParentJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            ICopyWellWorker copyWellWorker,
            ICopyWellboreWorker copyWellboreWorker,
            ICopyObjectsWorker copyObjectsWorker)
            : base(witsmlClientProvider, logger)
        {
            _copyWellWorker = copyWellWorker;
            _copyWellboreWorker = copyWellboreWorker;
            _copyObjectsWorker = copyObjectsWorker;
        }

        public JobType JobType => JobType.CopyWithParent;

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(CopyWithParentJob job, CancellationToken? cancellationToken = null)
        {
            RefreshAction refreshAction = null;
            List<CommonCopyReportItem> copyLogReportItems = new();

            if (job.CopyWellJob != null)
            {
                (WorkerResult result, RefreshAction refresh) wellResult = await _copyWellWorker.Execute(job.CopyWellJob, cancellationToken);
                refreshAction = wellResult.refresh;

                copyLogReportItems.Add(new CommonCopyReportItem
                {
                    Phase = "Copy well",
                    Message = wellResult.result.Message,
                    Status = GetJobStatus(wellResult.result.IsSuccess, cancellationToken)
                });

                if (!wellResult.result.IsSuccess)
                {
                    job.JobInfo.Report = CreateCopyWithParentReport(copyLogReportItems);
                    return wellResult;
                }
            }

            if (job.CopyWellboreJob != null)
            {
                (WorkerResult result, RefreshAction refresh) wellboreResult = await _copyWellboreWorker.Execute(job.CopyWellboreJob, cancellationToken);
                refreshAction ??= wellboreResult.refresh;

                copyLogReportItems.Add(new CommonCopyReportItem
                {
                    Phase = "Copy wellbore",
                    Message = wellboreResult.result.Message,
                    Status = GetJobStatus(wellboreResult.result.IsSuccess, cancellationToken)
                });

                if (!wellboreResult.result.IsSuccess)
                {
                    job.JobInfo.Report = CreateCopyWithParentReport(copyLogReportItems);
                    return wellboreResult;
                }
            }

            CopyObjectsJob copyObjectsJob = new()
            {
                Source = job.Source,
                Target = job.Target,
                ProgressReporter = new Progress<double>(progress =>
                {
                    job.ProgressReporter?.Report(progress);
                    if (job.JobInfo != null) job.JobInfo.Progress = progress;
                })
            };
            (WorkerResult objectsResult, RefreshAction objectsRefresh) = await _copyObjectsWorker.Execute(copyObjectsJob, cancellationToken);
            refreshAction ??= objectsRefresh;
            copyLogReportItems.Add(new CommonCopyReportItem
            {
                Phase = "Copy objects",
                Message = objectsResult.Message,
                Status = GetJobStatus(objectsResult.IsSuccess, cancellationToken)
            });
            job.JobInfo.Report = CreateCopyWithParentReport(copyLogReportItems);
            return (objectsResult, refreshAction);
        }

        private CommonCopyReport CreateCopyWithParentReport(List<CommonCopyReportItem> reportItems)
        {
            return new CommonCopyReport
            {
                Title = $"Copy with parent report",
                Summary = "Copy with parent report",
                ReportItems = reportItems
            };
        }
    }
}
