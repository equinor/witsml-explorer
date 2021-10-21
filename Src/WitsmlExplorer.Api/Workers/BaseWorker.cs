using System.IO;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public abstract class BaseWorker<T>
    {
        public async Task<(WorkerResult, RefreshAction)> Execute(Stream jobStream)
        {
            var job = await jobStream.Deserialize<T>();
            return await Execute(job);
        }

        public abstract Task<(WorkerResult, RefreshAction)> Execute(T job);
    }
}
