using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;



namespace WitsmlExplorer.Api.Workers
{
    public class DeleteBhaRunWorker : BaseWorker<DeleteBhaRunJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteBhaRuns;

        public DeleteBhaRunWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteBhaRunJob job)
        {
            Verify(job);

            var wellUid = job.BhaRunReferences.WellUid;
            var wellboreUid = job.BhaRunReferences.WellboreUid;
            var bhaRunUids = job.BhaRunReferences.BhaRunUids;
            var queries = BhaRunQueries.DeleteBhaRunQuery(wellUid, wellboreUid, bhaRunUids);
            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();

            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.DeleteFromStoreAsync(query);
                var bhaRun = query.BhaRuns.First();
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful", GetType().Name);
                    successUids.Add(bhaRun.Uid);
                }
                else
                {
                    Log.Error("Failed to delete bhaRun. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {bhaRunUid}, Reason: {Reason}",
                    wellUid,
                    wellboreUid,
                    query.BhaRuns.First().Uid,
                    result.Reason);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = bhaRun.WellName,
                        WellboreName = bhaRun.WellboreName,
                        ObjectName = bhaRun.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshBhaRuns(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted BhaRuns: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some BhaRuns", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private static void Verify(DeleteBhaRunJob job)
        {
            if (!job.BhaRunReferences.BhaRunUids.Any()) throw new ArgumentException("A minimum of one BhaRun UID is required");
            if (string.IsNullOrEmpty(job.BhaRunReferences.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.BhaRunReferences.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
