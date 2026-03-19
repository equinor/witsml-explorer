using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IJobQueue
    {
        void Enqueue(QueuedJob job);
        QueuedJob DequeueRegular();
        QueuedJob DequeueSlow();
    }

    public class QueuedJob
    {
        private readonly Job _job;
        private readonly Func<Task<(WorkerResult, RefreshAction)>> _run;

        public QueuedJob(Job job, Func<Task<(WorkerResult, RefreshAction)>> run)
        {
            _job = job ?? throw new ArgumentNullException(nameof(job));
            _run = run ?? throw new ArgumentNullException(nameof(run));
        }

        public bool IsSlowJob => _job.JobInfo.IsSlowJob;

        public bool TrySetStarted()
        {
            if (_job.JobInfo.CancellationTokenSource.IsCancellationRequested)
            {
                return false;
            }

            _job.JobInfo.Status = JobStatus.Started;
            return true;
        }

        public Task<(WorkerResult, RefreshAction)> Run()
        {
            return _run();
        }
    }

    public class JobQueue : IJobQueue
    {
        private readonly ConcurrentQueue<QueuedJob> _regularJobs = new();
        private readonly ConcurrentQueue<QueuedJob> _slowJobs = new();

        public void Enqueue(QueuedJob job)
        {
            if (job == null)
            {
                throw new ArgumentNullException(nameof(job));
            }

            if (job.IsSlowJob)
            {
                _slowJobs.Enqueue(job);
                return;
            }

            _regularJobs.Enqueue(job);
        }

        public QueuedJob DequeueRegular()
        {
            while (_regularJobs.TryDequeue(out QueuedJob job))
            {
                if (job.TrySetStarted())
                {
                    return job;
                }
            }

            return null;
        }

        public QueuedJob DequeueSlow()
        {
            while (_slowJobs.TryDequeue(out QueuedJob job))
            {
                if (job.TrySetStarted())
                {
                    return job;
                }
            }

            return null;
        }
    }
}
