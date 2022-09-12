using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;



namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteWbGeometrysWorker : BaseWorker<DeleteWbGeometryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IDeleteUtils _deleteUtils;
        public JobType JobType => JobType.DeleteWbGeometrys;

        public DeleteWbGeometrysWorker(ILogger<DeleteWbGeometryJob> logger, IWitsmlClientProvider witsmlClientProvider, IDeleteUtils deleteUtils) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _deleteUtils = deleteUtils;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWbGeometryJob job)
        {
            Verify(job);
            IEnumerable<WitsmlWbGeometry> queries = WbGeometryQueries.DeleteWbGeometryQuery(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.ObjectUids);
            RefreshWbGeometryObjects refreshAction = new(_witsmlClient.GetServerHostname(), job.ToDelete.WellUid, job.ToDelete.WellboreUid, RefreshType.Update);
            return await _deleteUtils.DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private static void Verify(DeleteWbGeometryJob job)
        {
            if (!job.ToDelete.ObjectUids.Any())
            {
                throw new ArgumentException("A minimum of one WbGeometry UID is required");
            }

            if (string.IsNullOrEmpty(job.ToDelete.WellUid))
            {
                throw new ArgumentException("WellUid is required");
            }

            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid))
            {
                throw new ArgumentException("WellboreUid is required");
            }
        }
    }
}
