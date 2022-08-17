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

namespace WitsmlExplorer.Api.Workers
{
    public class ModifyLogObjectWorker : BaseWorker<ModifyLogObjectJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyLogObject;

        public ModifyLogObjectWorker(ILogger<ModifyLogObjectJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyLogObjectJob job)
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
            var result = await _witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Log modified. {jobDescription}", job.Description());
                var refreshAction = new RefreshWellbore(_witsmlClient.GetServerHostname(), wellUid, wellboreUid, RefreshType.Update);
                return (new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Log updated ({job.LogObject.Name} [{logUid}])"), refreshAction);
            }

            const string errorMessage = "Failed to update log";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            var logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            var logs = await _witsmlClient.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.IdOnly));
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

            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
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
            if (string.IsNullOrEmpty(logObject.Name)) throw new InvalidOperationException($"{nameof(logObject.Name)} cannot be empty");
        }
    }
}
