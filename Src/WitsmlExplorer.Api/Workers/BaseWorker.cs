using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;

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

        private WitsmlCapServers _targetServerCapabilities;

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

        protected string GetJobStatus(bool status,
            CancellationToken? cancellationToken)
        {
            if (status) return "Success";
            if (cancellationToken is { IsCancellationRequested: true })
            {
                return JobStatus.Cancelled.ToString();
            }
            return "Fail";
        }

        protected string CancellationMessage()
        {
            return "The job was cancelled.";
        }

        protected string CancellationReason()
        {
            return "The job was cancelled by the user.";
        }
        protected async Task<WitsmlCapServers> GetTargetServerCapabilities()
        {
            if (_targetServerCapabilities == null)
            {
                _targetServerCapabilities = await GetTargetWitsmlClientOrThrow().GetCap();
            }
            return _targetServerCapabilities;
        }

        protected async Task<int> GetMaxBatchSize(int objectsCount, string functionType, string queryTypeName)
        {
            var targetServerCapabilities = await GetTargetServerCapabilities();
            var serverCapabilites =
                targetServerCapabilities.ServerCapabilities;

            var functions = serverCapabilites.Select(x => x.Functions.Find(y => y.Name.Equals(functionType)));
            var objectCapabilities = functions.Select(x =>
                x.DataObjects.Find(y => y.Name.Equals(queryTypeName)));

            var maxDataRows = objectCapabilities.FirstOrDefault().MaxDataNodes;
            var maxDataPoints = objectCapabilities.FirstOrDefault().MaxDataPoints;

            var maxBatchSize =
                Math.Min(maxDataRows, maxDataPoints / objectsCount);
            return maxBatchSize;
        }

        public async Task<(Task<(WorkerResult, RefreshAction)>, Job)> SetupWorker(Stream jobStream, CancellationToken? cancellationToken = null)
        {
            T job = await jobStream.Deserialize<T>();
            Task<(WorkerResult, RefreshAction)> task = ExecuteBase(job, cancellationToken);
            return (task, job);
        }

        private async Task<(WorkerResult, RefreshAction)> ExecuteBase(T job, CancellationToken? cancellationToken = null)
        {
            try
            {
                await Task.Delay(1); // Delay to return the task to JobService ASAP
                (WorkerResult WorkerResult, RefreshAction RefreshAction) task = await Execute(job, cancellationToken.Value);
                job.JobInfo.Status = task.WorkerResult.IsSuccess ? JobStatus.Finished : JobStatus.Failed;
                if (!task.WorkerResult.IsSuccess)
                {
                    if (cancellationToken is { IsCancellationRequested: true })
                    {
                        job.JobInfo.Status = JobStatus.Cancelled;
                    }
                    job.JobInfo.FailedReason = task.WorkerResult.Reason;
                }

                return task;
            }
            catch (OperationCanceledException ex)
            {
                job.JobInfo.Status = JobStatus.Cancelled;
                job.JobInfo.FailedReason = ex.Message;
                Logger.LogError("{jobType} was cancelled.", job.JobInfo.JobType);
                Uri sourceServerUrl = job.JobInfo.SourceServer != null ? new Uri(job.JobInfo.SourceServer) : null;
                return (new WorkerResult(new Uri(job.JobInfo.TargetServer), false, $"{job.JobInfo.JobType} cancelled", ex.Message, jobId: job.JobInfo.Id, sourceServerUrl: sourceServerUrl), null);
            }
            catch (Exception ex)
            {
                job.JobInfo.Status = JobStatus.Failed;
                job.JobInfo.FailedReason = ex.Message;
                Logger.LogError("An unexpected exception has occured during {jobType}: {ex}", job.JobInfo.JobType, ex);
                Uri sourceServerUrl = job.JobInfo.SourceServer != null ? new Uri(job.JobInfo.SourceServer) : null;
                return (new WorkerResult(new Uri(job.JobInfo.TargetServer), false, $"{job.JobInfo.JobType} failed", ex.Message, jobId: job.JobInfo.Id, sourceServerUrl: sourceServerUrl), null);
            }
        }

        public abstract Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(T job, CancellationToken? cancellationToken = null);
    }
}
