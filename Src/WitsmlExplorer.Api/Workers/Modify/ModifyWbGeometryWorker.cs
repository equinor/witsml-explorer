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
    public class ModifyWbGeometryWorker : BaseWorker<ModifyWbGeometryJob>, IWorker
    {
        public JobType JobType => JobType.ModifyWbGeometry;

        public ModifyWbGeometryWorker(ILogger<ModifyWbGeometryJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWbGeometryJob job)
        {
            WitsmlWbGeometrys modifyWbGeometryQuery = WbGeometryQueries.CreateWbGeometry(job.WbGeometry);
            QueryResult modifyWbGeometryResult = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(modifyWbGeometryQuery);

            if (!modifyWbGeometryResult.IsSuccessful)
            {
                const string errorMessage = "Failed to modify wbGeometry object";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, modifyWbGeometryResult.Reason), null);
            }

            Logger.LogInformation("WbGeometry modified. {jobDescription}", job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.WbGeometry.WellUid, job.WbGeometry.WellboreUid, EntityType.WbGeometry);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"WbGeometry {job.WbGeometry.Name} updated for {job.WbGeometry.WellboreName}");

            return (workerResult, refreshAction);
        }
    }
}
