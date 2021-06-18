using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Serilog;
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
    public interface ICreateWellWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CreateWellJob job);
    }

    public class CreateWellWorker: ICreateWellWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateWellJob job)
        {
            var well = job.Well;
            Verify(well);

            var wellToCreate = WellQueries.CreateWitsmlWell(well);
            var result = await witsmlClient.AddToStoreAsync(wellToCreate);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                await WaitUntilWellHasBeenCreated(well);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Well created ({well.Name} [{well.Uid}])");
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), well.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellName = well.Name };
            Log.Error($"Job failed. An error occurred when creating well: {job.Well.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create well", result.Reason, description), null);
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
                var wellResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isWellCreated = wellResult.Wells.Any();
            }
        }

        private void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Uid)) throw new InvalidOperationException($"{nameof(well.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(well.Name)) throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
            if (string.IsNullOrEmpty(well.TimeZone)) throw new InvalidOperationException($"{nameof(well.TimeZone)} cannot be empty");
        }
    }
}
