using System.Threading.Tasks;

using Serilog;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyBhaRunWorker : BaseWorker<ModifyBhaRunJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyBhaRun;

        public ModifyBhaRunWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyBhaRunJob job)
        {
            var modifyBhaRunQuery = BhaRunQueries.CreateBhaRun(job.BhaRun);
            var modifyBhaRunResult = await witsmlClient.UpdateInStoreAsync(modifyBhaRunQuery);

            if (!modifyBhaRunResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify bhaRun";
                Log.Error("{ErrorMessage}. Target: WellUid: {TargetWellUid}, WellboreUid: {TargetWellboreUid}",
                    errorMessage, job.BhaRun.WellUid, job.BhaRun.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyBhaRunResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. BhaRun modified", GetType().Name);
            var refreshAction = new RefreshBhaRuns(witsmlClient.GetServerHostname(), job.BhaRun.WellUid, job.BhaRun.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"BhaRun {job.BhaRun.Name} updated for {job.BhaRun.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
