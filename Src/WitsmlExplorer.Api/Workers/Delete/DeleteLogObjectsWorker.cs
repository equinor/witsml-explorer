using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public interface IDeleteLogObjectsWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(DeleteLogObjectsJob job);
    }

    public class DeleteLogObjectsWorker : BaseWorker<DeleteLogObjectsJob>, IWorker, IDeleteLogObjectsWorker
    {
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteLogObjects;

        public DeleteLogObjectsWorker(ILogger<DeleteLogObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(witsmlClientProvider, logger)
        {
            _deleteUtils = deleteUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteLogObjectsJob job)
        {
            job.ToDelete.Verify();
            IEnumerable<WitsmlLog> queries = ObjectQueries.DeleteObjectsQuery<WitsmlLog>(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.ObjectUids);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, EntityType.Log);
            return await _deleteUtils.DeleteObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction);
        }

    }
}
