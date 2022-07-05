using System.Threading.Tasks;
using Serilog;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyRiskWorker : BaseWorker<ModifyRiskJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyRisk;

        public ModifyRiskWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyRiskJob job)
        {
            var modifyRiskQuery = RiskQueries.CreateRisk(job.Risk);
            var modifyRiskResult = await witsmlClient.UpdateInStoreAsync(modifyRiskQuery);

            if (!modifyRiskResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify risk object";
                Log.Error("{ErrorMessage}. Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                    errorMessage, job.Risk.UidWell, job.Risk.UidWellbore);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyRiskResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Risk modified", GetType().Name);
            var refreshAction = new RefreshRisks(witsmlClient.GetServerHostname(), job.Risk.UidWell, job.Risk.UidWellbore, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Risk {job.Risk.Name} updated for {job.Risk.NameWellbore}");

            return (workerResult, refreshAction);
        }
    }
}
