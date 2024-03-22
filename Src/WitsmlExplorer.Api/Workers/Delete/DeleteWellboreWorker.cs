using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Delete
{
    public class DeleteWellboreWorker : BaseWorker<DeleteWellboreJob>, IWorker
    {
        public JobType JobType => JobType.DeleteWellbore;

        public DeleteWellboreWorker(ILogger<DeleteWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWellboreJob job, CancellationToken? cancellationToken = null)
        {
            string wellUid = job.ToDelete.WellUid;
            string wellboreUid = job.ToDelete.WellboreUid;

            WitsmlWellbores witsmlWellbore = WellboreQueries.DeleteWitsmlWellbore(wellUid, wellboreUid);
            QueryResult result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(witsmlWellbore);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted wellbore. WellUid: {WellUid}, WellboreUid: {WellboreUid}",
                wellUid,
                wellboreUid);
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, RefreshType.Remove);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Deleted wellbore: ${wellboreUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete wellbore. WellUid: {WellUid}, WellboreUid: {WellboreUid}",
                wellUid,
                wellboreUid);

            witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellUid, wellboreUid);
            WitsmlWellbores queryResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));

            EntityDescription description = null;
            WitsmlWellbore wellbore = queryResult.Wellbores.FirstOrDefault();
            if (wellbore != null)
            {
                description = new EntityDescription
                {
                    WellName = wellbore.NameWell,
                    ObjectName = wellbore.Name
                };
            }

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Failed to delete wellbore", result.Reason, description), null);
        }
    }
}
