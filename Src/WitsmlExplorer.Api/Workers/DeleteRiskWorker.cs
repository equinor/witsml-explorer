using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteRiskWorker : BaseWorker<DeleteRiskJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteRisk;

        public DeleteRiskWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteRiskJob job)
        {
            var wellUid = job.RiskReference.WellUid;
            var wellboreUid = job.RiskReference.WellboreUid;
            var uid = job.RiskReference.Uid;
            var deleteRequest = RiskQueries.DeleteRiskQuery(wellUid, wellboreUid, uid);

            var result = await witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete risk. WellUid: {WellUid}", wellUid);

            var query = RiskQueries.QueryById(wellUid, wellboreUid, uid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
            EntityDescription description = null;
            var risk = queryResult.Risks.FirstOrDefault();
            if (risk != null)
            {
                description = new EntityDescription
                {
                    ObjectName = risk.Name
                };
            }
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete risk", result.Reason, description), null);
        }

    }
}
