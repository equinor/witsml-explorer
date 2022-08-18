using System.IO;
using System.Threading.Tasks;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IWorker
    {
        JobType JobType { get; }
        Task<(Task<(WorkerResult, RefreshAction)>, IJob)> SetupWorker(Stream jobStream);
    }
}
