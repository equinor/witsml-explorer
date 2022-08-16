using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.Query;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class DeleteMudLogWorker : BaseWorker<DeleteMudLogJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.DeleteMudLog;

        public DeleteMudLogWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMudLogJob job)
        {
            var wellUid = job.ToDelete.WellUid;
            var wellboreUid = job.ToDelete.WellboreUid;
            var uid = job.ToDelete.Uid;

            var deleteRequest = DeleteRequest(wellUid, wellboreUid, uid);

            var result = await witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted mudLog with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Log.Error("Failed to delete mudLog. : {Uid}", uid);

            var query = MudLogQueries.QueryById(wellUid, wellboreUid, uid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
            EntityDescription description = null;
            var mudLog = queryResult.MudLogs.FirstOrDefault();
            if (mudLog != null)
            {
                description = new EntityDescription
                {
                    ObjectName = mudLog.Name
                };
            }
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete mudLog", result.Reason, description), null);

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
