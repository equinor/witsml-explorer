using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyRiskWorker : BaseWorker<ModifyRiskJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyRisk;

        public ModifyRiskWorker(ILogger<ModifyRiskJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyRiskJob job)
        {
            var modifyRiskQuery = RiskQueries.CreateRisk(job.Risk);
            var modifyRiskResult = await _witsmlClient.UpdateInStoreAsync(modifyRiskQuery);

            if (!modifyRiskResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify risk object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, modifyRiskResult.Reason), null);
            }

            Logger.LogInformation("Risk modified. {jobDescription}", job.Description());
            var refreshAction = new RefreshRisks(_witsmlClient.GetServerHostname(), job.Risk.WellUid, job.Risk.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Risk {job.Risk.Name} updated for {job.Risk.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
