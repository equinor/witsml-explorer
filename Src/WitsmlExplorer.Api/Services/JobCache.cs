using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;

namespace WitsmlExplorer.Api.Services
{

    public static class JobCache
    {
        private static readonly ConcurrentDictionary<string, JobInfo> Jobs;
        private static DateTime s_nextCleanup;
        private static readonly int InitialCapacity = 4000;
        private static readonly int JobLifespanHours = 96;
        private static readonly int CleanupIntervalHours = 1;

        static JobCache()
        {
            int concurrencyLevel = Environment.ProcessorCount * 2;
            Jobs = new ConcurrentDictionary<string, JobInfo>(concurrencyLevel, InitialCapacity);
            s_nextCleanup = DateTime.Now.AddHours(CleanupIntervalHours);
        }

        public static void CacheJob(JobInfo job)
        {
            job.KillTime = job.StartTime.AddHours(JobLifespanHours);
            Jobs[job.Id] = job;

            if (DateTime.Now > s_nextCleanup)
            {
                Parallel.Invoke(Cleanup);
                s_nextCleanup = DateTime.Now.AddHours(CleanupIntervalHours);
            }
        }

        private static void Cleanup()
        {
            foreach (var job in Jobs)
            {
                if (DateTime.Now > job.Value.KillTime)
                {
                    Jobs.TryRemove(job);
                }
            }
        }

    }
}
