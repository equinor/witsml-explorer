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
    public class DeleteBhaRunWorker : BaseWorker<DeleteBhaRunsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteBhaRuns;

        public DeleteBhaRunWorker(ILogger<DeleteBhaRunsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteBhaRunsJob job)
        {
            Verify(job);
            var queries = BhaRunQueries.DeleteBhaRunQuery(job.ToDelete.WellUid, job.ToDelete.WellboreUid, job.ToDelete.BhaRunUids);
            return await DeleteUtils.DeleteMultiple(queries, Logger, _witsmlClient);
        }

        private static void Verify(DeleteBhaRunsJob job)
        {
            if (!job.ToDelete.BhaRunUids.Any()) throw new ArgumentException("A minimum of one BhaRun UID is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
