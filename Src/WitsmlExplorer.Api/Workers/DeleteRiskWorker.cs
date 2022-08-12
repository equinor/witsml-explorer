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
    public class DeleteRiskWorker : BaseWorker<DeleteRisksJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteRisks;

        public DeleteRiskWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRisksJob job)
        {
            Verify(job);

            var wellUid = job.ToDelete.WellUid;
            var wellboreUid = job.ToDelete.WellboreUid;
            var riskUids = job.ToDelete.RiskUids;
            var queries = RiskQueries.DeleteRiskQuery(wellUid, wellboreUid, riskUids);
            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();

            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await _witsmlClient.DeleteFromStoreAsync(query);
                var risk = query.Risks.First();
                if (result.IsSuccessful)
                {
                    Log.Information("{JobType} - Job successful", GetType().Name);
                    successUids.Add(risk.Uid);
                }
                else
                {
                    Log.Error("Failed to delete risk. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {riskUid}, Reason: {Reason}",
                    wellUid,
                    wellboreUid,
                    query.Risks.First().Uid,
                    result.Reason);
                    error = true;
                    errorReasons.Add(result.Reason);
                    errorEnitities.Add(new EntityDescription
                    {
                        WellName = risk.NameWell,
                        WellboreName = risk.NameWellbore,
                        ObjectName = risk.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshRisks(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted risks: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some risks", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private static void Verify(DeleteRisksJob job)
        {
            if (!job.ToDelete.RiskUids.Any()) throw new ArgumentException("A minimum of one risk UID is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.ToDelete.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
