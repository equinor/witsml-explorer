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
        private readonly ConcurrentQueue<Task<(WorkerResult, RefreshAction)>> _jobs = new();

        public void Enqueue(Task<(WorkerResult, RefreshAction)> job)
        {
            if (job == null)
            {
                throw new ArgumentNullException(nameof(job));
            }

            _jobs.Enqueue(job);
        }

        public Task<(WorkerResult, RefreshAction)> Dequeue()
        {
            bool hasJob = _jobs.TryDequeue(out Task<(WorkerResult, RefreshAction)> job);

            return hasJob ? job : null;
        }
    }
}
