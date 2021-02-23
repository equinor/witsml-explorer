using System;
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
    public interface IModifyLogObjectWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(ModifyLogObjectJob job);
    }

    public class ModifyLogObjectWorker : IModifyLogObjectWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public ModifyLogObjectWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(ModifyLogObjectJob job)
        {
            Verify(job.LogObject);

            var wellUid = job.LogObject.WellUid;
            var wellboreUid = job.LogObject.WellboreUid;
            var logUid = job.LogObject.Uid;

            var query = CreateRequest(wellUid, wellboreUid, logUid,
                new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = job.LogObject.Name
                });
            var result = await witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(witsmlClient.GetServerHostname(), true, $"Log updated ({job.LogObject.Name} [{logUid}])"), refreshAction);
            }

            Log.Error($"Job failed. An error occurred when modifying logobject: {job.LogObject.PrintProperties()}");
            var logQuery = LogQueries.QueryById(wellUid, wellboreUid, logUid);
            var logs = await witsmlClient.GetFromStoreAsync(logQuery, OptionsIn.IdOnly);
            var log = logs.Logs.FirstOrDefault();
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

            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update log", result.Reason, description), null);
        }

        private static WitsmlLogs CreateRequest(string wellUid, string wellboreUid, string logUid, WitsmlLog logObject)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = logUid,
                    Name = logObject.Name
                }.AsSingletonList()
            };
        }

        private void Verify(LogObject logObject)
        {
            if (string.IsNullOrEmpty(logObject.Name)) throw new InvalidOperationException($"{nameof(logObject.Name)} cannot be empty");
        }
    }
}
