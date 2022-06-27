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
    public class DeleteTubularWorker : BaseWorker<DeleteTubularJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteTubular;

        public DeleteTubularWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularJob job)
        {
            Verify(job);

            var wellUid = job.TubularReferences.WellUid;
            var wellboreUid = job.TubularReferences.WellboreUid;
            var tubularUids = job.TubularReferences.TubularUids;

            var queries = TubularQueries.DeleteWitsmlTubulars(wellUid, wellboreUid, tubularUids);
            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();
            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.DeleteFromStoreAsync(query);
                var tubular = query.Tubulars.First();
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful", GetType().Name);
                    successUids.Add(tubular.Uid);
                }
                else
                {
                    Log.Error("Failed to delete tubular. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {TubularUid}, Reason: {Reason}",
                    wellUid,
                    wellboreUid,
                    query.Tubulars.First().Uid,
                    result.Reason);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = tubular.NameWell,
                        WellboreName = tubular.NameWellbore,
                        ObjectName = tubular.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted tubulars: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some tubulars", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private static void Verify(DeleteTubularJob job)
        {
            if (!job.TubularReferences.TubularUids.Any()) throw new ArgumentException("A minimum of one tubular UID is required");
            if (string.IsNullOrEmpty(job.TubularReferences.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.TubularReferences.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
