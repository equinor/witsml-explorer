using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceLogObjectsWorker : BaseWorker<ReplaceLogObjectsJob>, IWorker
    {
        private readonly ICopyLogWorker _copyWorker;
        private readonly IDeleteLogObjectsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceLogObjects;

        public ReplaceLogObjectsWorker(ILogger<ReplaceLogObjectsJob> logger, ICopyLogWorker copyWorker, IDeleteLogObjectsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceLogObjectsJob job)
        {
            (WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob);
            if (!result.Item1.IsSuccess)
            {
                return result;
            }
            return await _copyWorker.Execute(job.CopyJob);
        }
    }
}
