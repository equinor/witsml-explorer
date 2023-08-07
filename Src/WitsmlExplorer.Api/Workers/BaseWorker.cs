using System;
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
namespace WitsmlExplorer.Api.Workers
{
    public abstract class BaseWorker<T> where T : Job
    {
        protected ILogger<T> Logger { get; }
        private IWitsmlClientProvider WitsmlClientProvider { get; }

        public BaseWorker(ILogger<T> logger = null)
        {
            Logger = logger;
        }
        public BaseWorker(IWitsmlClientProvider witsmlClientProvider, ILogger<T> logger = null)
        {
            Logger = logger;
            WitsmlClientProvider = witsmlClientProvider;
        }
        protected IWitsmlClient GetTargetWitsmlClientOrThrow()
        {
            return WitsmlClientProvider.GetClient() ?? throw new WitsmlClientProviderException($"Missing Target WitsmlClient for {typeof(T)}", (int)HttpStatusCode.Unauthorized, ServerType.Target);
        }
        protected IWitsmlClient GetSourceWitsmlClientOrThrow()
        {
            return WitsmlClientProvider.GetSourceClient() ?? throw new WitsmlClientProviderException($"Missing Source WitsmlClient for {typeof(T)}", (int)HttpStatusCode.Unauthorized, ServerType.Source);
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
                await Task.Delay(1); // Delay to return the task to JobService ASAP
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
                return (new WorkerResult(new Uri(job.JobInfo.TargetServer), false, $"{job.JobInfo.JobType} failed", ex.Message, jobId: job.JobInfo.Id), null);
            }
        }

        public abstract Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(T job);
    }
}
