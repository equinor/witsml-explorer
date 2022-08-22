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
            var job = await jobStream.Deserialize<T>();
            var task = ExecuteBase(job);
            return (task, job);
        }

        private async Task<(WorkerResult, RefreshAction)> ExecuteBase(T job)
        {
            try
            {
                job.JobInfo.Status = JobStatus.Started;
                var task = await Execute(job);
                job.JobInfo.Status = task.Item1.IsSuccess ? JobStatus.Finished : JobStatus.Failed;
                return task;
            }
            catch (Exception ex)
            {
                job.JobInfo.Status = JobStatus.Failed;
                Logger.LogError("An unexpected exception has occured: {ex}", ex);
                throw;
            }
        }

        public abstract Task<(WorkerResult, RefreshAction)> Execute(T job);
    }
}
