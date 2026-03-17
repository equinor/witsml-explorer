using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Text.Json;
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

    public class JobFullInfo
    {
        public JobType JobType { get; set; }
        public JobInfo JobInfo { get; set; }
        public Stream JobStream { get; set; }
    }

    public class Jojo
    {
        public JobInfo JobInfo { get; set; }
        public Stream JobStream { get; set; }
        public JobType JobType { get; set; }
    }

    public class JobService : IJobService
    {
        private readonly IJobCache _jobCache;
        private readonly IJobQueue _jobQueue;
        private readonly IEnumerable<IWorker> _workers;
        private readonly IJobProgressService _jobProgressService;
        private static Timer queueCheckTimer;
        private readonly ConcurrentQueue<JobFullInfo> longJobsQueue = new();
        private readonly ConcurrentQueue<Jojo> kju = new();
        private static readonly object queueLock = new object();

        public JobService(IJobQueue jobQueue, IEnumerable<IWorker> workers, IJobCache jobCache, IJobProgressService jobProgressService)
        {
            _jobQueue = jobQueue;
            _workers = workers;
            _jobCache = jobCache;
            _jobProgressService = jobProgressService;

            // Start periodic queue checking every 1 second
            queueCheckTimer = new Timer(CheckQueue, null, TimeSpan.Zero, TimeSpan.FromSeconds(10));

            // Simulate adding items to the queue from another thread

        }


        private void CheckQueue(object state)
        {
            lock (queueLock)
            {
                var slowJobCount = _jobCache.GetAllJobInfos().Count(x => x.IsSlowJob && x.Status == JobStatus.Started);
                while (slowJobCount > 0)
                {
                    Thread.Sleep(50);
                    slowJobCount = _jobCache.GetAllJobInfos().Count(x => x.IsSlowJob && x.Status == JobStatus.Started);
                }

                if (longJobsQueue.Count > 0)
                {
                    JobFullInfo jobFullInfo;
                    longJobsQueue.TryDequeue(out jobFullInfo);


                    if (jobFullInfo != null)
                    {
                        IWorker worker = _workers.FirstOrDefault(worker =>
                            worker.JobType == jobFullInfo.JobType);
                        if (worker == null)
                        {
                            throw new ArgumentOutOfRangeException(
                                nameof(jobFullInfo.JobType),
                                jobFullInfo.JobType,
                                $"No worker setup to execute {jobFullInfo.JobType}");
                        }

                        (Task<(WorkerResult, RefreshAction)> task,
                            Job job) = Task
                            .Run(() =>
                                worker.SetupWorker(jobFullInfo.JobStream,
                                    jobFullInfo.JobInfo
                                        .CancellationTokenSource.Token))
                            .GetAwaiter().GetResult();
                        job.JobInfo = jobFullInfo.JobInfo;
                        job.JobInfo.Status = JobStatus.Queued;
                        job.ProgressReporter = new Progress<double>(
                            progress =>
                                _jobProgressService.ReportProgress(
                                    new JobProgress(jobFullInfo.JobInfo.Id,
                                        progress)));
                        _jobQueue.Enqueue(task);
                        _jobCache.CacheJob(job.JobInfo);
                        return;
                    }
                }
            }
        }



        public async Task<string> CreateJob(JobType jobType, JobInfo jobInfo, Stream jobStream)
        {

            byte[] buffer;
            using (var msTemp = new MemoryStream())
            {
                await jobStream.CopyToAsync(msTemp);
                buffer = msTemp.ToArray();
            }
            var memoryStreamForSLowJob = new MemoryStream(buffer);
            var memoryStream = new MemoryStream(buffer);
            IWorker worker = _workers.FirstOrDefault(worker => worker.JobType == jobType);
            if (worker == null)
            {
                throw new ArgumentOutOfRangeException(nameof(jobType), jobType, $"No worker setup to execute {jobType}");
            }
            (Task<(WorkerResult, RefreshAction)> task, Job job) = await worker.SetupWorker(memoryStream, jobInfo.CancellationTokenSource.Token);

            job.JobInfo = jobInfo;

            if (jobInfo.IsSlowJob)
            {
                var jobFullInfo = new JobFullInfo()
                {
                    JobInfo = jobInfo,
                    JobType = jobType,
                    JobStream = memoryStreamForSLowJob
                };
                longJobsQueue.Enqueue(jobFullInfo);
                return null;
            }

            job.ProgressReporter = new Progress<double>(progress => _jobProgressService.ReportProgress(new JobProgress(jobInfo.Id, progress)));
            _jobQueue.Enqueue(task);
            _jobCache.CacheJob(job.JobInfo);

            return job.JobInfo.Id;
        }
    }
}
