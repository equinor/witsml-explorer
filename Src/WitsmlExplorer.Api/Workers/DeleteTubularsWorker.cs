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
    public class DeleteTubularsWorker : BaseWorker<DeleteTubularsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteTubular;

        public DeleteTubularsWorker(ILogger<DeleteTubularsJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _deleteUtils = deleteUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularsJob job)
        {
            Verify(job);
            var queries = TubularQueries.DeleteWitsmlTubulars(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.TubularUids);
            var refreshAction = new RefreshTubulars(_witsmlClient.GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, RefreshType.Update);
            return await _deleteUtils.DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private static void Verify(DeleteTubularsJob job)
        {
            if (!job.ToDelete.TubularUids.Any()) throw new ArgumentException("A minimum of one tubular UID is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
