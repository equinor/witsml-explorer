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

            var wellboreToCreate = SetupWellboreToCreate(wellbore);

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
            var query = WellboreQueries.QueryByUid(wellbore.WellUid, wellbore.Uid);
            var maxRetries = 30;
            while (!isWellboreCreated)
            {
                if (--maxRetries == 0)
                {
                    throw new InvalidOperationException($"Not able to read newly created wellbore with name {wellbore.Name} (id={wellbore.Uid})");
                }
                Thread.Sleep(1000);
                var wellboreResult = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
                isWellboreCreated = wellboreResult.Wellbores.Any();
            }
        }

        private static WitsmlWellbores SetupWellboreToCreate(Wellbore wellbore)
        {
            if (wellbore.WellboreParentUid != "")
            {
                return new WitsmlWellbores
                {
                    Wellbores = new WitsmlWellbore
                    {
                        Uid = wellbore.Uid,
                        Name = wellbore.Name,
                        UidWell = wellbore.WellUid,
                        NameWell = wellbore.WellName,
                        ParentWellbore = new WitsmlParentWellbore
                        {
                            UidRef = wellbore.WellboreParentUid,
                            Value = wellbore.WellboreParentName
                        },
                        PurposeWellbore = wellbore.WellborePurpose

                    }.AsSingletonList()
                };
            }

            return new WitsmlWellbores
            {
                Wellbores = new WitsmlWellbore
                {
                    Uid = wellbore.Uid,
                    Name = wellbore.Name,
                    UidWell = wellbore.WellUid,
                    NameWell = wellbore.WellName,
                    PurposeWellbore = wellbore.WellborePurpose
                }.AsSingletonList()
            };
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
