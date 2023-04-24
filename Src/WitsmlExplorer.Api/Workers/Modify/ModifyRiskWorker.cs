using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyRiskWorker : BaseWorker<ModifyRiskJob>, IWorker
    {
        public JobType JobType => JobType.ModifyRisk;

        public ModifyRiskWorker(ILogger<ModifyRiskJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyRiskJob job)
        {
            WitsmlRisks modifyRiskQuery = RiskQueries.CreateRisk(job.Risk);
            QueryResult modifyRiskResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(modifyRiskQuery);

            if (!modifyRiskResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify risk object";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyRiskResult.Reason), null);
            }

            Logger.LogInformation("Risk modified. {jobDescription}", job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Risk.WellUid, job.Risk.WellboreUid, EntityType.Risk);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Risk {job.Risk.Name} updated for {job.Risk.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
