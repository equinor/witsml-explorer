using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IJobQueue
    {
        void Enqueue(Task<(WorkerResult, RefreshAction)> job);
        Task<(WorkerResult, RefreshAction)> Dequeue();
    }

    public class JobQueue : IJobQueue
    {
        private readonly ConcurrentQueue<Task<(WorkerResult, RefreshAction)>> jobs = new();

        public void Enqueue(Task<(WorkerResult, RefreshAction)> job)
        {
            if (job == null) throw new ArgumentNullException(nameof(job));

            jobs.Enqueue(job);
        }

        public Task<(WorkerResult, RefreshAction)> Dequeue()
        {
            var hasJob = jobs.TryDequeue(out var job);

            return hasJob ? job : null;
        }
    }
}
