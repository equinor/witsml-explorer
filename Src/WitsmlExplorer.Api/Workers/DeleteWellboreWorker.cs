using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteWellboreWorker
    {
        Task<(WorkerResult, RefreshWellbore)> Execute(DeleteWellboreJob job);
    }

    public class DeleteWellboreWorker : IDeleteWellboreWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteWellboreWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshWellbore)> Execute(DeleteWellboreJob job)
        {
            var wellUid = job.WellboreReference.WellUid;
            var wellboreUid = job.WellboreReference.WellboreUid;

            var query = WellboreQueries.DeleteWellboreQuery(wellUid, wellboreUid);
            var result = await witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful.", GetType().Name);
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted wellbore: ${wellboreUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete wellbore. WellUid: {WellUid}, WellboreUid: {WellboreUid}",
                wellUid,
                wellboreUid);

            query = WellboreQueries.QueryByUid(wellUid, wellboreUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);

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

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete wellbore", result.Reason, description), null);
        }
    }
}
