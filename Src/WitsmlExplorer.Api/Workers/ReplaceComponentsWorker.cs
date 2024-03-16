using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

namespace WitsmlExplorer.Api.Workers
{
    public class ReplaceComponentsWorker : BaseWorker<ReplaceComponentsJob>, IWorker
    {
        private readonly ICopyComponentsWorker _copyWorker;
        private readonly IDeleteComponentsWorker _deleteWorker;

        public JobType JobType => JobType.ReplaceComponents;

        public ReplaceComponentsWorker(ILogger<ReplaceComponentsJob> logger, ICopyComponentsWorker copyWorker, IDeleteComponentsWorker deleteWorker) : base(logger)
        {
            _copyWorker = copyWorker;
            _deleteWorker = deleteWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ReplaceComponentsJob job, CancellationToken? cancellationToken = null)
        {
            (WorkerResult WorkerResult, RefreshAction) result = await _deleteWorker.Execute(job.DeleteJob, cancellationToken);
            if (!result.WorkerResult.IsSuccess)
            {
                return result;
            }
            return await _copyWorker.Execute(job.CopyJob, cancellationToken);
        }
    }
}
