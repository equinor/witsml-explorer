using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyWbGeometryWorker : BaseWorker<ModifyWbGeometryJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyWbGeometry;

        public ModifyWbGeometryWorker(ILogger<ModifyWbGeometryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWbGeometryJob job)
        {
            var modifyWbGeometryQuery = WbGeometryQueries.CreateWbGeometry(job.WbGeometry);
            var modifyWbGeometryResult = await _witsmlClient.UpdateInStoreAsync(modifyWbGeometryQuery);

            if (!modifyWbGeometryResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify wbGeometry object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, modifyWbGeometryResult.Reason), null);
            }

            Logger.LogInformation("WbGeometry modified. {jobDescription}", job.Description());
            var refreshAction = new RefreshWbGeometryObjects(_witsmlClient.GetServerHostname(), job.WbGeometry.WellUid, job.WbGeometry.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"WbGeometry {job.WbGeometry.Name} updated for {job.WbGeometry.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
