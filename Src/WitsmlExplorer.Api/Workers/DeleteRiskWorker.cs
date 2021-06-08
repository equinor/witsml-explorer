using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Query;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteRiskWorker
    {
        Task<WorkerResult> Execute(DeleteRiskJob job);
    }

    public class DeleteRiskWorker: IDeleteRiskWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteRiskWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<WorkerResult> Execute(DeleteRiskJob job)
        {
            var wellUid = job.RiskReference.WellUid;
            var wellboreUid = job.RiskReference.WellboreUid;
            var uid = job.RiskReference.Uid;
           
           var deleteRequest = DeleteRequest(wellUid, wellboreUid, uid); 

            var result = await witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful.", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return workerResult;
            }

            Log.Error("Failed to delete risk. WellUid: {WellUid}");

            var query = WellQueries.QueryByUid(uid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
            EntityDescription description = null;
            var risk = queryResult.Wells.FirstOrDefault();
            if (risk != null)
            {
                description = new EntityDescription
                {
                    ObjectName = risk.Name
                };
            }

            return new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete risk", result.Reason, description);
        }

        private static WitsmlRisks DeleteRequest(string wellUid, string wellboreUid, string uid)
        {
            return new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = uid
                }.AsSingletonList()
            };
        }
    }
}
