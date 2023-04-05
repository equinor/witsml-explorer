using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public class CopyLogWithParentWorker : BaseWorker<CopyLogWithParentJob>, IWorker
    {
        private readonly ICopyWellWorker _copyWellWorker;
        private readonly ICopyWellboreWorker _copyWellboreWorker;

        private readonly ICopyLogWorker _copyLogWorker;

        public CopyLogWithParentWorker(
            ILogger<CopyLogWithParentJob> logger,
            IWitsmlClientProvider witsmlClientProvider,
            ICopyWellWorker copyWellWorker,
            ICopyWellboreWorker copyWellboreWorker,
            ICopyLogWorker copyLogWorker)
            : base(witsmlClientProvider, logger)
        {
            _copyWellWorker = copyWellWorker;
            _copyWellboreWorker = copyWellboreWorker;
            _copyLogWorker = copyLogWorker;
        }

        public JobType JobType => JobType.CopyLogWithParent;

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(CopyLogWithParentJob job)
        {
            if (job.CopyWellJob != null)
            {
                (WorkerResult result, RefreshAction) wellResult = await _copyWellWorker.Execute(job.CopyWellJob);

                if (!wellResult.result.IsSuccess)
                {
                    return wellResult;
                }
            }

            if (job.CopyWellboreJob != null)
            {
                (WorkerResult result, RefreshAction) wellboreResult = await _copyWellboreWorker.Execute(job.CopyWellboreJob);

                if (!wellboreResult.result.IsSuccess)
                {
                    return wellboreResult;
                }
            }

            return await _copyLogWorker.Execute(new() { Source = job.Source, Target = job.Target });
        }
    }
}
