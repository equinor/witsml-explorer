using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
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

            if (job.CopyWellJob != null)
            {
                (WorkerResult result, RefreshAction refresh) wellResult = await _copyWellWorker.Execute(job.CopyWellJob);
                refreshAction = wellResult.refresh;

                if (!wellResult.result.IsSuccess)
                {
                    return wellResult;
                }
            }

            if (job.CopyWellboreJob != null)
            {
                (WorkerResult result, RefreshAction refresh) wellboreResult = await _copyWellboreWorker.Execute(job.CopyWellboreJob);
                refreshAction ??= wellboreResult.refresh;

                if (!wellboreResult.result.IsSuccess)
                {
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
            (WorkerResult objectsResult, RefreshAction objectsRefresh) = await _copyObjectsWorker.Execute(copyObjectsJob);
            refreshAction ??= objectsRefresh;
            return (objectsResult, refreshAction);
        }
    }
}
