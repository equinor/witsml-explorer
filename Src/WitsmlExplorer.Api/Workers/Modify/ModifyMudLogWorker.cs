using System;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.MudLog;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyMudLogWorker : BaseWorker<ModifyMudLogJob>, IWorker
    {
        public JobType JobType => JobType.ModifyMudLog;

        public ModifyMudLogWorker(ILogger<ModifyMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyMudLogJob job)
        {
            MudLog mudLog = job.MudLog;
            Verify(mudLog);
            WitsmlMudLogs mudLogToUpdate = MudLogQueries.SetupMudLogToUpdate(mudLog);
            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(mudLogToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("MudLog modified. {jobDescription}", job.Description());
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), mudLog.WellUid, mudLog.WellboreUid, EntityType.MudLog);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"MudLog updated ({mudLog.Name} [{mudLog.Uid}])"), refreshAction);

            }
            EntityDescription description = new() { WellboreName = mudLog.WellboreName };
            const string errorMessage = "Failed to update mudLog";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());

            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(MudLog mudLog)
        {
            if (string.IsNullOrEmpty(mudLog.Name))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
            }
        }
    }
}
