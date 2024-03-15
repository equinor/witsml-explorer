using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobService
    {
        Task<string> CreateJob(JobType jobType, JobInfo jobInfo, Stream jobStream);

    }

    public class JobService : IJobService
    {
        private readonly IJobCache _jobCache;
        private readonly IJobQueue _jobQueue;
        private readonly IEnumerable<IWorker> _workers;
        private readonly IJobProgressService _jobProgressService;

        public JobService(IJobQueue jobQueue, IEnumerable<IWorker> workers, IJobCache jobCache, IJobProgressService jobProgressService)
        {
            _jobQueue = jobQueue;
            _workers = workers;
            _jobCache = jobCache;
            _jobProgressService = jobProgressService;
        }

        public async Task<string> CreateJob(JobType jobType, JobInfo jobInfo, Stream jobStream)
        {
            IWorker worker = _workers.FirstOrDefault(worker => worker.JobType == jobType);
            if (worker == null)
            {
                throw new ArgumentOutOfRangeException(nameof(jobType), jobType, $"No worker setup to execute {jobType}");
            }
            (Task<(WorkerResult, RefreshAction)> task, Job job) = await worker.SetupWorker(jobStream, jobInfo.CancellationTokenSource.Token);
            job.JobInfo = jobInfo;
            job.ProgressReporter = new Progress<double>(progress => _jobProgressService.ReportProgress(new JobProgress(jobInfo.Id, progress)));
            _jobQueue.Enqueue(task);
            _jobCache.CacheJob(job.JobInfo);

            return job.JobInfo.Id;
        }
    }
}
