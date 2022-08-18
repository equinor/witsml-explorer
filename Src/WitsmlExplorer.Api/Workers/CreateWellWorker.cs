using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CreateWellWorker : BaseWorker<CreateWellJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.CreateWell;

        public CreateWellWorker(ILogger<CreateWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CreateWellJob job)
        {
            var well = job.Well;
            Verify(well);

            var wellToCreate = WellQueries.CreateWitsmlWell(well);
            var result = await _witsmlClient.AddToStoreAsync(wellToCreate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Well created. {jobDescription}", job.Description());
                await WaitUntilWellHasBeenCreated(well);
                var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Well created ({well.Name} [{well.Uid}])");
                var refreshAction = new RefreshWell(_witsmlClient.GetServerHostname(), well.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellName = well.Name };
            var errorMessage = "Failed to create well.";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private async Task WaitUntilWellHasBeenCreated(Well well)
        {
            var isWellCreated = false;
            var query = WellQueries.GetWitsmlWellByUid(well.Uid);
            var maxRetries = 30;
            while (!isWellCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created well with name {well.Name} (id={well.Uid})");
                }
                Thread.Sleep(1000);
                var wellResult = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.IdOnly));
                isWellCreated = wellResult.Wells.Any();
            }
        }

        private static void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Uid)) throw new InvalidOperationException($"{nameof(well.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(well.Name)) throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
            if (string.IsNullOrEmpty(well.TimeZone)) throw new InvalidOperationException($"{nameof(well.TimeZone)} cannot be empty");
        }
    }
}
