using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data.Rig;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteRigsWorker : BaseWorker<DeleteRigsJob>, IWorker
    {
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteRigs;

        public DeleteRigsWorker(ILogger<DeleteRigsJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(witsmlClientProvider, logger)
        {
            _deleteUtils = deleteUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRigsJob job)
        {
            job.ToDelete.Verify();
            IEnumerable<WitsmlRig> queries = ObjectQueries.DeleteObjectsQuery<WitsmlRig>(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.ObjectUids);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, EntityType.Rig);
            return await _deleteUtils.DeleteObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction);
        }

    }
}
