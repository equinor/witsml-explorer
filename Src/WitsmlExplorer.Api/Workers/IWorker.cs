using System.Threading.Tasks;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public interface IWorker<in T>
    {
        Task<(WorkerResult, RefreshAction)> Execute(T job);
    }
}
