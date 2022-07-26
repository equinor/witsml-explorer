using System.Threading.Tasks;
using Serilog;
using Witsml;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyWbGeometryWorker : BaseWorker<ModifyWbGeometryJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyWbGeometry;

        public ModifyWbGeometryWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWbGeometryJob job)
        {
            var modifyWbGeometryQuery = WbGeometryQueries.CreateWbGeometry(job.WbGeometry);
            var modifyWbGeometryResult = await witsmlClient.UpdateInStoreAsync(modifyWbGeometryQuery);

            if (!modifyWbGeometryResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify wbGeometry object";
                Log.Error("{ErrorMessage}. Target: WellUid: {TargetWellUid}, WellboreUid: {TargetWellboreUid}",
                    errorMessage, job.WbGeometry.WellUid, job.WbGeometry.WellboreUid);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, modifyWbGeometryResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. WbGeometry modified", GetType().Name);
            var refreshAction = new RefreshWbGeometry(witsmlClient.GetServerHostname(), job.WbGeometry.WellUid, job.WbGeometry.WellboreUid, job.WbGeometry.Uid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"WbGeometry {job.WbGeometry.Name} updated for {job.WbGeometry.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
