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
    public interface IDeleteLogObjectWorker
    {
        Task<(WorkerResult, RefreshWellbore)> Execute(DeleteLogObjectJob job);
    }

    public class DeleteLogObjectWorker: IDeleteLogObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public DeleteLogObjectWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshWellbore)> Execute(DeleteLogObjectJob job)
        {
            var wellUid = job.LogObject.WellUid;
            var wellboreUid = job.LogObject.WellboreUid;
            var logUid = job.LogObject.LogUid;

            var query = CreateRequest(wellUid, wellboreUid, logUid);
            var result = await witsmlClient.DeleteFromStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful.", GetType().Name);
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Deleted log: ${logUid}"), new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update));
            }

            Log.Error("Failed to delete log object. WellUid: {WellUid}, WellboreUid: {WellboreUid}, Uid: {LogUid}",
                wellUid,
                wellboreUid,
                logUid);

            query = LogQueries.QueryById(wellUid, wellboreUid, logUid);
            var queryResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);

            var log = queryResult.Logs.First();
            EntityDescription description = null;
            if (log != null)
            {
                description = new EntityDescription
                {
                    WellName = log.NameWell,
                    WellboreName = log.NameWellbore,
                    ObjectName = log.Name
                };
            }
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to delete log", result.Reason, description), null);
        }

        private static WitsmlLogs CreateRequest(string wellUid, string wellboreUid, string logUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = logUid
                }.AsSingletonList()
            };
        }

    }
}
