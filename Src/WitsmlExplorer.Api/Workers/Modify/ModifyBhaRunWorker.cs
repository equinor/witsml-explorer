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
    public class ModifyBhaRunWorker : BaseWorker<ModifyBhaRunJob>, IWorker
    {
        public JobType JobType => JobType.ModifyBhaRun;

        public ModifyBhaRunWorker(ILogger<ModifyBhaRunJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyBhaRunJob job)
        {
            WitsmlBhaRuns modifyBhaRunQuery = BhaRunQueries.CreateBhaRun(job.BhaRun);
            QueryResult modifyBhaRunResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(modifyBhaRunQuery);

            if (!modifyBhaRunResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify bhaRun";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyBhaRunResult.Reason), null);
            }

            Logger.LogInformation("BhaRun modified. {jobDescription}", job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.BhaRun.WellUid, job.BhaRun.WellboreUid, EntityType.BhaRun);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"BhaRun {job.BhaRun.Name} updated for {job.BhaRun.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
