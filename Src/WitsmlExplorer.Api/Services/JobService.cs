using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.OpenApi.Extensions;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Services
{
    public interface IJobService
    {
        void CreateJob(JobType jobType, Stream httpRequestBody);
    }

    public class JobService : IJobService
    {
        private readonly IJobQueue jobQueue;
        private readonly IEnumerable<IWorker> workers;

        public JobService(IJobQueue jobQueue, IEnumerable<IWorker> workers)
        {
            this.jobQueue = jobQueue;
            this.workers = workers;
        }

        public void CreateJob(JobType jobType, Stream jobStream)
        {
            var worker = workers.FirstOrDefault(worker => worker.JobType == jobType);
            if (worker == null)
                throw new ArgumentOutOfRangeException(nameof(jobType), jobType, $"No worker setup to execute {jobType.GetDisplayName()}");

            jobQueue.Enqueue(worker.Execute(jobStream));
        }
    }
}
