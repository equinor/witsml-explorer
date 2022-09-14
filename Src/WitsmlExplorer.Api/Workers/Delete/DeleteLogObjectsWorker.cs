using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
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
        private readonly IWitsmlClient _witsmlClient;
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteLogObjects;

        public DeleteLogObjectsWorker(ILogger<DeleteLogObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
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
            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            return await _deleteUtils.DeleteObjectsOnWellbore(queries, refreshAction);
        }

    }
}
