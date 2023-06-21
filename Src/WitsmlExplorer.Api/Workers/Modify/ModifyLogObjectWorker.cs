using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyLogObjectWorker : BaseWorker<ModifyLogObjectJob>, IWorker
    {
        public JobType JobType => JobType.ModifyLogObject;

        public ModifyLogObjectWorker(ILogger<ModifyLogObjectJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyLogObjectJob job)
        {
            Verify(job.LogObject);

            string wellUid = job.LogObject.WellUid;
            string wellboreUid = job.LogObject.WellboreUid;
            string logUid = job.LogObject.Uid;

            WitsmlLogs query = CreateRequest(wellUid, wellboreUid, logUid,
                new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = job.LogObject.Name
                });
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Log modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Log);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Log updated ({job.LogObject.Name} [{logUid}])"), refreshAction);
            }

            const string errorMessage = "Failed to update log";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs logs = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.IdOnly));
            WitsmlLog log = logs.Logs.FirstOrDefault();
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

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
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

        private static void Verify(LogObject logObject)
        {
            if (string.IsNullOrEmpty(logObject.Name))
            {
                throw new InvalidOperationException($"{nameof(logObject.Name)} cannot be empty");
            }
        }
    }
}
