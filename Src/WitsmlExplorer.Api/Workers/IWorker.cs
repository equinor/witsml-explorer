using System.IO;
using System.Threading;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IWorker
    {
        JobType JobType { get; }
        Task<Job> CreateJob(Stream jobStream);
        Task<(WorkerResult, RefreshAction)> ExecuteJob(Job job, CancellationToken? cancellationToken = null);
    }
}
