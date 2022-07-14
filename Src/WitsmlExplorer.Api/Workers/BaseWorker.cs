using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Workers
{
    public abstract class BaseWorker<T>
    {
        protected readonly ILogger<BaseWorker<T>> _logger;
        public BaseWorker(ILogger<BaseWorker<T>> logger = null)
        {
            _logger = logger;
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(Stream jobStream)
        {
            var job = await jobStream.Deserialize<T>();
            try
            {
                return await Execute(job);
            }
            catch (Exception ex)
            {
                _logger.LogError("An unexpected exception has occured: {ex}", ex);
                throw;
            }
        }

        public abstract Task<(WorkerResult, RefreshAction)> Execute(T job);
    }
}
