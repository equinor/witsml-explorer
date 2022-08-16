using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.DeleteMudLog;

        public DeleteMudLogWorker(ILogger<DeleteMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(DeleteMudLogJob job)
        {
            var wellUid = job.ToDelete.WellUid;
            var wellboreUid = job.ToDelete.WellboreUid;
            var uid = job.ToDelete.Uid;

            var deleteRequest = DeleteRequest(wellUid, wellboreUid, uid);

            var result = await _witsmlClient.DeleteFromStoreAsync(deleteRequest);

            if (result.IsSuccessful)
            {
                Logger.LogInformation("Deleted mudLog. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}",
                        wellUid,
                        wellboreUid,
                        uid);
                var refreshAction = new RefreshWell(_witsmlClient.GetServerHostname(), wellUid, RefreshType.Remove);
                var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Deleted mudLog with uid ${wellUid}");
                return (workerResult, refreshAction);
            }

            Logger.LogError("Failed to delete mudLog. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {Uid}",
                        wellUid,
                        wellboreUid,
                        uid);
            var query = MudLogQueries.QueryById(wellUid, wellboreUid, uid);
            var queryResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
            EntityDescription description = null;
            var mudLog = queryResult.MudLogs.FirstOrDefault();
            if (mudLog != null)
            {
                description = new EntityDescription
                {
                    ObjectName = mudLog.Name
                };
            }
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, "Failed to delete mudLog", result.Reason, description), null);

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
