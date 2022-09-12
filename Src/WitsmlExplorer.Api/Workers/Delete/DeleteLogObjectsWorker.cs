using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
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
            Verify(job);

            string wellUid = job.ToDelete.LogReferenceList.First().WellUid;
            string wellboreUid = job.ToDelete.LogReferenceList.First().WellboreUid;
            IEnumerable<WitsmlLog> queries = job.ToDelete.LogReferenceList.Select(CreateRequest);
            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            return await _deleteUtils.DeleteObjectsOnWellbore(queries, refreshAction);
        }

        private static WitsmlLog CreateRequest(LogReference logReference)
        {
            return new WitsmlLog
            {
                UidWell = logReference.WellUid,
                UidWellbore = logReference.WellboreUid,
                Uid = logReference.LogUid
            };
        }

        private static void Verify(DeleteLogObjectsJob job)
        {
            if (!job.ToDelete.LogReferenceList.Any())
            {
                throw new ArgumentException("A minimum of one job is required");
            }

            if (job.ToDelete.LogReferenceList.Select(l => l.WellboreUid).Distinct().Count() != 1)
            {
                throw new ArgumentException("All logs should belong to the same Wellbore");
            }

            if (string.IsNullOrEmpty(job.ToDelete.LogReferenceList.First().WellUid))
            {
                throw new ArgumentException("WellUid is required");
            }

            if (string.IsNullOrEmpty(job.ToDelete.LogReferenceList.First().WellboreUid))
            {
                throw new ArgumentException("WellboreUid is required");
            }
        }
    }
}
