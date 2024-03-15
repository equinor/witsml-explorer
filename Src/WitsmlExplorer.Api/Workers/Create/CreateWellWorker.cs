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
    public class CreateWellWorker : BaseWorker<CreateWellJob>, IWorker
    {
        public JobType JobType => JobType.CreateWell;

        public CreateWellWorker(ILogger<CreateWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateWellJob job, CancellationToken? cancellationToken = null)
        {
            Well well = job.Well;
            Verify(well);

            WitsmlWells wellToCreate = WellQueries.CreateWitsmlWell(well);
            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(wellToCreate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Well created. {jobDescription}", job.Description());
                await WaitUntilWellHasBeenCreated(well);
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Well created ({well.Name} [{well.Uid}])");
                RefreshWell refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), well.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            EntityDescription description = new() { WellName = well.Name };
            string errorMessage = "Failed to create well.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private async Task WaitUntilWellHasBeenCreated(Well well)
        {
            bool isWellCreated = false;
            WitsmlWells query = WellQueries.GetWitsmlWellByUid(well.Uid);
            int maxRetries = 30;
            while (!isWellCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created well with name {well.Name} (id={well.Uid})");
                }
                Thread.Sleep(1000);
                WitsmlWells wellResult = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isWellCreated = wellResult.Wells.Any();
            }
        }

        private static void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Uid))
            {
                throw new InvalidOperationException($"{nameof(well.Uid)} cannot be empty");
            }

            if (string.IsNullOrEmpty(well.Name))
            {
                throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
            }

            if (string.IsNullOrEmpty(well.TimeZone))
            {
                throw new InvalidOperationException($"{nameof(well.TimeZone)} cannot be empty");
            }
        }
    }
}
