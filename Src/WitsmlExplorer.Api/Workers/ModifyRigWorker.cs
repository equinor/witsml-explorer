using System.Threading.Tasks;

using Serilog;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyRigWorker : BaseWorker<ModifyRigJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyRig;

        public ModifyRigWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyRigJob job)
        {
            var modifyRigQuery = RigQueries.CreateRig(job.Rig);
            var modifyRigResult = await witsmlClient.UpdateInStoreAsync(modifyRigQuery);

            if (!modifyRigResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify rig object";
                Log.Error("{ErrorMessage}. Target: WellUid: {TargetWellUid}, WellboreUid: {TargetWellboreUid}",
                    errorMessage, job.Rig.WellUid, job.Rig.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyRigResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Rig modified", GetType().Name);
            var refreshAction = new RefreshRigs(witsmlClient.GetServerHostname(), job.Rig.WellUid, job.Rig.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Rig {job.Rig.Name} updated for {job.Rig.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
