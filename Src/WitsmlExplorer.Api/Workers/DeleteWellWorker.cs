using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteWellWorker
    {
        Task<(WorkerResult, RefreshWell)> Execute(DeleteWellJob job);
    }

    public class DeleteWellWorker : IDeleteWellWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshWell)> Execute(DeleteWellJob job)
        {
            var wellUid = job.WellReference.WellUid;

            var witsmlWell = WellQueries.DeleteWitsmlWell(wellUid);
            var result = await witsmlClient.DeleteFromStoreAsync(witsmlWell);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted well with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete well. WellUid: {WellUid}", wellUid);

            witsmlWell = WellQueries.GetWitsmlWellByUid(wellUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(witsmlWell, new OptionsIn(ReturnElements.IdOnly));

            EntityDescription description = null;

            var wellbore = queryResult.Wells.FirstOrDefault();
            if (wellbore != null)
            {
                description = new EntityDescription
                {
                    ObjectName = wellbore.Name
                };
            }

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete well", result.Reason, description), null);
        }
    }
}
