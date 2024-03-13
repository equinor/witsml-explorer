using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data.MudLog;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateMudLogWorker : BaseWorker<CreateMudLogJob>, IWorker
    {
        public JobType JobType => JobType.CreateMudLog;

        public CreateMudLogWorker(ILogger<CreateMudLogJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateMudLogJob job, CancellationToken? cancellationToken = null)
        {
            MudLog mudLog = job.MudLog;
            Verify(mudLog);

            WitsmlMudLogs mudLogToCreate = mudLog.ToWitsml();

            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(mudLogToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilMudLogHasBeenCreated(mudLog);
                Logger.LogInformation("MudLog created. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"MudLog created ({mudLog.Name} [{mudLog.Uid}])");
                RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), mudLog.WellUid, mudLog.WellboreUid, EntityType.MudLog);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellboreName = mudLog.WellboreName };
            string errorMessage = "Failed to create mudLog.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private async Task WaitUntilMudLogHasBeenCreated(MudLog mudLog)
        {
            bool isMudLogCreated = false;
            WitsmlMudLogs query = MudLogQueries.QueryById(mudLog.WellUid, mudLog.WellboreUid, new string[] { mudLog.Uid });
            int maxRetries = 30;
            while (!isMudLogCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created MudLog with name {mudLog.Name} (id={mudLog.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlMudLogs mudLogResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isMudLogCreated = mudLogResult.MudLogs.Any();
            }
        }

        private static void Verify(MudLog mudLog)
        {
            if (string.IsNullOrEmpty(mudLog.Uid))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(mudLog.Name))
            {
                throw new InvalidOperationException($"{nameof(mudLog.Name)} cannot be empty");
            }
        }
    }
}
