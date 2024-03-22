using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobCache
    {
        void CacheJob(JobInfo jobInfo);
        ICollection<JobInfo> GetJobInfosByUser(string username);
        JobInfo GetJobInfoById(string jobId);
        ICollection<JobInfo> GetAllJobInfos();
    }

    public class JobCache : IJobCache
    {
        private readonly ConcurrentDictionary<string, JobInfo> _jobs;
        private DateTime _nextCleanup;
        private static readonly int InitialCapacity = 4000;
        private static readonly int JobLifespanHours = 96;
        private static readonly int CleanupIntervalHours = 1;
        private readonly ILogger<JobCache> _logger;

        public JobCache(ILogger<JobCache> logger)
        {
            int concurrencyLevel = Environment.ProcessorCount * 2;
            _jobs = new ConcurrentDictionary<string, JobInfo>(concurrencyLevel, InitialCapacity);
            _nextCleanup = DateTime.Now.AddHours(CleanupIntervalHours);
            _logger = logger;
        }

        public void CacheJob(JobInfo jobInfo)
        {
            jobInfo.KillTime = jobInfo.StartTime.AddHours(JobLifespanHours);
            _jobs[jobInfo.Id] = jobInfo;

            if (DateTime.Now > _nextCleanup)
            {
                Task.Run(Cleanup);
                _nextCleanup = DateTime.Now.AddHours(CleanupIntervalHours);
            }
        }

        public ICollection<JobInfo> GetJobInfosByUser(string username)
        {
            return _jobs.Values.Where(job => job.Username == username).ToList();
        }

        public JobInfo GetJobInfoById(string jobId)
        {
            return _jobs[jobId];
        }

        public ICollection<JobInfo> GetAllJobInfos()
        {
            return _jobs.Values;
        }

        private void Cleanup()
        {
            _logger.LogInformation("JobCache start cleanup, jobs: {count}", _jobs.Count);
            int deleted = 0;
            int failed = 0;
            foreach (KeyValuePair<string, JobInfo> job in _jobs)
            {
                if (DateTime.Now > job.Value.KillTime)
                {
                    bool success = _jobs.TryRemove(job);
                    if (!success)
                    {
                        _logger.LogError("Failed to delete jobInfo {id}", job.Key);
                        failed += 1;
                    }
                    else
                    {
                        deleted += 1;
                    }
                }
            }
            _logger.LogInformation("JobCache cleanup finished, deleted: {deleted}, failed: {failed}, remaining: {remaining}", deleted, failed, _jobs.Count);
        }
    }
}
