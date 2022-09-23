using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public abstract class BaseWorker<T> where T : Job
    {
        protected ILogger<T> Logger { get; }
        public BaseWorker(ILogger<T> logger = null)
        {
            Logger = logger;
        }

        public async Task<(Task<(WorkerResult, RefreshAction)>, Job)> SetupWorker(Stream jobStream)
        {
            T job = await jobStream.Deserialize<T>();
            Task<(WorkerResult, RefreshAction)> task = ExecuteBase(job);
            return (task, job);
        }

        private async Task<(WorkerResult, RefreshAction)> ExecuteBase(T job)
        {
            try
            {
                job.JobInfo.Status = JobStatus.Started;
                (WorkerResult WorkerResult, RefreshAction RefreshAction) task = await Execute(job);
                job.JobInfo.Status = task.WorkerResult.IsSuccess ? JobStatus.Finished : JobStatus.Failed;
                if (!task.WorkerResult.IsSuccess)
                {
                    job.JobInfo.FailedReason = task.WorkerResult.Reason;
                }

                return task;
            }
            catch (Exception ex)
            {
                job.JobInfo.Status = JobStatus.Failed;
                job.JobInfo.FailedReason = ex.Message;
                Logger.LogError("An unexpected exception has occured: {ex}", ex);
                return (new WorkerResult(new Uri(job.JobInfo.TargetServer), false, $"{job.JobInfo.JobType} failed", ex.Message), null);
            }
        }

        public abstract Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(T job);
    }
}
