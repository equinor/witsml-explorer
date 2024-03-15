using System;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceObjectsWorker : BaseWorker<ReplaceObjectsJob>, IWorker
    {
        private readonly ICopyObjectsWorker _copyWorker;
        private readonly IDeleteObjectsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceObjects;

        public ReplaceObjectsWorker(ILogger<ReplaceObjectsJob> logger, ICopyObjectsWorker copyWorker, IDeleteObjectsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceObjectsJob job, CancellationToken? cancellationToken = null)
        {
            (WorkerResult WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob, cancellationToken);
            if (!result.WorkerResult.IsSuccess)
            {
                return result;
            }

            job.CopyJob.ProgressReporter = new Progress<double>(progress =>
                {
                    job.ProgressReporter?.Report(progress);
                    if (job.JobInfo != null) job.JobInfo.Progress = progress;
                });
            return await _copyWorker.Execute(job.CopyJob, cancellationToken);
        }
    }
}
