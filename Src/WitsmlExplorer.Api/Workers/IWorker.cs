using System.IO;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IWorker
    {
        JobType JobType { get; }
        Task<(WorkerResult, RefreshAction)> Execute(Stream jobStream);
    }
}
