using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteWellboreWorker : BaseWorker<DeleteWellboreJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteWellbore;

        public DeleteWellboreWorker(ILogger<DeleteWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteWellboreJob job)
        {
            var wellUid = job.ToDelete.WellUid;
            var wellboreUid = job.ToDelete.WellboreUid;

            var witsmlWellbore = WellboreQueries.DeleteWitsmlWellbore(wellUid, wellboreUid);
            var result = await _witsmlClient.DeleteFromStoreAsync(witsmlWellbore);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted wellbore. WellUid: {WellUid}, WellboreUid: {WellboreUid}",
                wellUid,
                wellboreUid);
                var refreshAction = new RefreshWellbore(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Remove);
                var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Deleted wellbore: ${wellboreUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete wellbore. WellUid: {WellUid}, WellboreUid: {WellboreUid}",
                wellUid,
                wellboreUid);

            witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellUid, wellboreUid);
            var queryResult = await _witsmlClient.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));

            EntityDescription description = null;
            var wellbore = queryResult.Wellbores.FirstOrDefault();
            if (wellbore != null)
            {
                description = new EntityDescription
                {
                    WellName = wellbore.NameWell,
                    ObjectName = wellbore.Name
                };
            }

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete wellbore", result.Reason, description), null);
        }
    }
}
