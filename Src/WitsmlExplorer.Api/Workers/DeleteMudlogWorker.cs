using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Query;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Workers
{
    public interface IDeleteMudLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(DeleteMudLogJob job);
    }

    public class DeleteMudlogWorker : IDeleteMudLogWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteMudlogWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(DeleteMudLogJob job)
        {
            var wellUid = job.MudLogReference.WellUid;
            var wellboreUid = job.MudLogReference.WellboreUid;
            var uid = job.MudLogReference.Uid;

            var deleteRequest = DeleteRequest(wellUid, wellboreUid, uid);

            var result = await witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful.", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted mudlog with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete Mudlog. : {uid}", uid);

            var query = MudLogQueries.QueryById(wellUid, wellboreUid, uid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
            EntityDescription description = null;
            var mudlog = queryResult.MudLogs.FirstOrDefault();
            if (mudlog != null)
            {
                description = new EntityDescription
                {
                    ObjectName = mudlog.Name
                };
            }
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete mudlog", result.Reason, description), null);

        }

        private static WitsmlMudLogs DeleteRequest(string wellUid, string wellboreUid, string uid)
        {
            return new WitsmlMudLogs
            {
                MudLogs = new WitsmlMudLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = uid
                }.AsSingletonList()
            };
        }
    }
}
