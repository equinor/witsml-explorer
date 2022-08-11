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
    public class DeleteTubularWorker : BaseWorker<DeleteTubularsJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteTubular;

        public DeleteTubularWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteTubularsJob job)
        {
            Verify(job);

            var wellUid = job.Source.WellUid;
            var wellboreUid = job.Source.WellboreUid;
            var tubularUids = job.Source.TubularUids;

            var queries = TubularQueries.DeleteWitsmlTubulars(wellUid, wellboreUid, tubularUids);
            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();
            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await _witsmlClient.DeleteFromStoreAsync(query);
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

            var refreshAction = new RefreshWellbore(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted tubulars: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some tubulars", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private static void Verify(DeleteTubularsJob job)
        {
            if (!job.Source.TubularUids.Any()) throw new ArgumentException("A minimum of one tubular UID is required");
            if (string.IsNullOrEmpty(job.Source.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.Source.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
