using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using DnsClient.Protocol.Options;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models.Reports;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobCache
    {
        void CacheJob(JobInfo jobInfo);
        ICollection<JobInfo> GetJobInfosByUser(string username);
        JobInfo GetJobInfoById(string jobId);
        ICollection<JobInfo> GetAllJobInfos();
        IEnumerable<object> GetReportItems(string jobId);
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
            var allJobs = _jobs.Values.Where(job => job.Username == username).ToList();
            return HandleBigData(allJobs);
        }

        public JobInfo GetJobInfoById(string jobId)
        {
            return _jobs[jobId];
        }

        public ICollection<JobInfo> GetAllJobInfos()
        {
            var allJobs = _jobs.Values.ToList();
            return HandleBigData(allJobs);
        }

        public IEnumerable<object> GetReportItems (string jobId)
        {
            var job = _jobs[jobId];
            if (job != null)
            {
                var reportItems = job.Report?.ReportItems;
                return reportItems;
            }
            return null;
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

        private static ICollection<JobInfo> HandleBigData(ICollection<JobInfo> allJobs)
        {
            var resultJobs = new List<JobInfo>();
            foreach (var job in allJobs)
            {
                if (job.Report!= null && job.Report.DownloadImmediately)
                {
                    var copyJob = job with { Report = new BaseReport() { Title = job.Report?.Title, ReportHeader = job.Report?.ReportHeader, DownloadImmediately = true } };
                    resultJobs.Add(copyJob);
                }
                else { resultJobs.Add(job); }
            }
            return resultJobs;
        }
    }
}
