using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CreateWellboreWorker : IWorker<CreateWellboreJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public CreateWellboreWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CreateWellboreJob job)
        {
            var wellbore = job.Wellbore;
            Verify(wellbore);

            var wellboreToCreate = WellboreQueries.CreateWitsmlWellbore(wellbore);

            var result = await witsmlClient.AddToStoreAsync(wellboreToCreate);
            if (result.IsSuccessful)
            {
                await WaitUntilWellboreHasBeenCreated(wellbore);
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Wellbore created ({wellbore.Name} [{wellbore.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), wellbore.WellUid, wellbore.Uid, RefreshType.Add);
                return (workerResult, refreshAction);
            }

            var description = new EntityDescription { WellboreName = wellbore.Name };
            Log.Error($"Job failed. An error occurred when creating wellbore: {job.Wellbore.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to create wellbore", result.Reason, description), null);
        }

        private async Task WaitUntilWellboreHasBeenCreated(Wellbore wellbore)
        {
            var isWellboreCreated = false;
            var witsmlWellbore = WellboreQueries.GetWitsmlWellboreByUid(wellbore.WellUid, wellbore.Uid);
            var maxRetries = 30;
            while (!isWellboreCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created wellbore with name {wellbore.Name} (id={wellbore.Uid})");
                }
                Thread.Sleep(1000);
                var wellboreResult = await witsmlClient.GetFromStoreAsync(witsmlWellbore, OptionsIn.IdOnly);
                isWellboreCreated = wellboreResult.Wellbores.Any();
            }
        }

        private void Verify(Wellbore wellbore)
        {
            if (string.IsNullOrEmpty(wellbore.Uid)) throw new InvalidOperationException($"{nameof(wellbore.Uid)} cannot be empty");
            if (string.IsNullOrEmpty(wellbore.Name)) throw new InvalidOperationException($"{nameof(wellbore.Name)} cannot be empty");
            if (string.IsNullOrEmpty(wellbore.WellUid)) throw new InvalidOperationException($"{nameof(wellbore.WellUid)} cannot be empty");
            if (string.IsNullOrEmpty(wellbore.WellName)) throw new InvalidOperationException($"{nameof(wellbore.WellName)} cannot be empty");
        }
    }
}
