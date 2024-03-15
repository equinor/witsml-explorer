using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Create
{
    public class CreateWellboreWorker : BaseWorker<CreateWellboreJob>, IWorker
    {
        public JobType JobType => JobType.CreateWellbore;

        public CreateWellboreWorker(ILogger<CreateWellboreJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateWellboreJob job, CancellationToken? cancellationToken = null)
        {
            Wellbore wellbore = job.Wellbore;
            Verify(wellbore);

            WitsmlWellbores wellboreToCreate = WellboreQueries.CreateWitsmlWellbore(wellbore);

            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(wellboreToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilWellboreHasBeenCreated(wellbore);
                Logger.LogInformation("Wellbore created. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Wellbore created ({wellbore.Name} [{wellbore.Uid}])");
                RefreshWellbore refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellbore.WellUid, wellbore.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellboreName = wellbore.Name };
            string errorMessage = "Failed to create wellbore.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private async Task WaitUntilWellboreHasBeenCreated(Wellbore wellbore)
        {
            bool isWellboreCreated = false;
            WitsmlWellbores witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellbore.WellUid, wellbore.Uid);
            int maxRetries = 30;
            while (!isWellboreCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created wellbore with name {wellbore.Name} (id={wellbore.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlWellbores wellboreResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));
                isWellboreCreated = wellboreResult.Wellbores.Any();
            }
        }

        private static void Verify(Wellbore wellbore)
        {
            if (string.IsNullOrEmpty(wellbore.Uid))
            {
                throw new InvalidOperationException($"{nameof(wellbore.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(wellbore.Name))
            {
                throw new InvalidOperationException($"{nameof(wellbore.Name)} cannot be empty");
            }

            if (string.IsNullOrEmpty(wellbore.WellUid))
            {
                throw new InvalidOperationException($"{nameof(wellbore.WellUid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(wellbore.WellName))
            {
                throw new InvalidOperationException($"{nameof(wellbore.WellName)} cannot be empty");
            }
        }
    }
}
