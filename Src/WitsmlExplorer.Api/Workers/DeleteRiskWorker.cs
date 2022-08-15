using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteRiskWorker : BaseWorker<DeleteRisksJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteRisks;

        public DeleteRiskWorker(ILogger<DeleteRisksJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRisksJob job)
        {
            Verify(job);
            var queries = RiskQueries.DeleteRiskQuery(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.RiskUids);
            return await DeleteUtils.DeleteMultiple(queries, Logger, _witsmlClient);
        }

        private static void Verify(DeleteRisksJob job)
        {
            if (!job.ToDelete.RiskUids.Any()) throw new ArgumentException("A minimum of one risk UID is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
