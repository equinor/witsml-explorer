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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyBhaRun;

        public ModifyBhaRunWorker(ILogger<ModifyBhaRunJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyBhaRunJob job)
        {
            WitsmlBhaRuns modifyBhaRunQuery = BhaRunQueries.CreateBhaRun(job.BhaRun);
            QueryResult modifyBhaRunResult = await _witsmlClient.UpdateInStoreAsync(modifyBhaRunQuery);

            if (!modifyBhaRunResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify bhaRun";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, modifyBhaRunResult.Reason), null);
            }

            Logger.LogInformation("BhaRun modified. {jobDescription}", job.Description());
            RefreshBhaRuns refreshAction = new(_witsmlClient.GetServerHostname(), job.BhaRun.WellUid, job.BhaRun.WellboreUid, RefreshType.Update);
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"BhaRun {job.BhaRun.Name} updated for {job.BhaRun.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
