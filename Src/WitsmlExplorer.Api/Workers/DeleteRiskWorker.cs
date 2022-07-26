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
    public class DeleteRiskWorker : BaseWorker<DeleteRiskJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteRisks;

        public DeleteRiskWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRiskJob job)
        {
            Verify(job);

            var wellUid = job.RiskReferences.WellUid;
            var wellboreUid = job.RiskReferences.WellboreUid;
            var riskUids = job.RiskReferences.RiskUids;
            var queries = RiskQueries.DeleteRiskQuery(wellUid, wellboreUid, riskUids);
            bool error = false;
            var successUids = new List<string>();
            var errorReasons = new List<string>();
            var errorEnitities = new List<EntityDescription>();

            var results = await Task.WhenAll(queries.Select(async (query) =>
            {
                var result = await witsmlClient.DeleteFromStoreAsync(query);
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
                        WellName = risk.WellName,
                        WellboreName = risk.WellboreName,
                        ObjectName = risk.Name
                    });
                }
                return result;
            }));

            var refreshAction = new RefreshRisks(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
            var successString = successUids.Count > 0 ? $"Deleted risks: {string.Join(", ", successUids)}." : "";
            if (!error)
            {
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, successString), refreshAction);
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, $"{successString} Failed to delete some risks", errorReasons.First(), errorEnitities.First()), successUids.Count > 0 ? refreshAction : null);
        }

        private static void Verify(DeleteRiskJob job)
        {
            if (!job.RiskReferences.RiskUids.Any()) throw new ArgumentException("A minimum of one risk UID is required");
            if (string.IsNullOrEmpty(job.RiskReferences.WellUid)) throw new ArgumentException("WellUid is required");
            if (string.IsNullOrEmpty(job.RiskReferences.WellboreUid)) throw new ArgumentException("WellboreUid is required");
        }
    }
}
