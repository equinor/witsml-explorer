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
    public class DeleteRigsWorker : BaseWorker<DeleteRigsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteRigs;

        public DeleteRigsWorker(ILogger<DeleteRigsJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _deleteUtils = deleteUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRigsJob job)
        {
            Verify(job);
            var queries = RigQueries.DeleteRigQuery(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.RigUids);
            var refreshAction = new RefreshRigs(_witsmlClient.GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, RefreshType.Update);
            return await _deleteUtils.DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private static void Verify(DeleteRigsJob job)
        {
            if (!job.ToDelete.RigUids.Any()) throw new ArgumentException("A minimum of one Rig UID is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
