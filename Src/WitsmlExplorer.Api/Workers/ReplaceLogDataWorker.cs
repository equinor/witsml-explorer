using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceLogDataWorker : BaseWorker<ReplaceLogDataJob>, IWorker
    {
        private readonly ICopyLogDataWorker _copyWorker;
        private readonly IDeleteComponentsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceLogData;

        public ReplaceLogDataWorker(ILogger<ReplaceLogDataJob> logger, ICopyLogDataWorker copyWorker, IDeleteComponentsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceLogDataJob job)
        {
            (WorkerResult WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob);
            if (!result.WorkerResult.IsSuccess)
            {
                return result;
            }
            return await _copyWorker.Execute(job.CopyJob);
        }
    }
}
