using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
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

            string wellUid = job.ToDelete.WellUid;
            string wellboreUid = job.ToDelete.WellboreUid;
            IEnumerable<WitsmlLog> queries = job.ToDelete.ObjectUids.Select(uid => new WitsmlLog
            {
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                Uid = uid
            });
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.LogObject);
            return await _deleteUtils.DeleteObjectsOnWellbore(GetTargetWitsmlClientOrThrow(), queries, refreshAction);
        }

    }
}
