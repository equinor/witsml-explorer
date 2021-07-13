using System;
using System.Linq;
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
    public class ModifyWellboreWorker : IWorker<ModifyWellboreJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public ModifyWellboreWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellboreJob job)
        {
            Verify(job.Wellbore);

            var wellUid = job.Wellbore.WellUid;
            var wellboreUid = job.Wellbore.Uid;

            var witsmlWellbore = WellboreQueries.UpdateWitsmlWellbore(wellUid, wellboreUid);
            var wellbore = witsmlWellbore.Wellbores.First();
            wellbore.Name = job.Wellbore.Name;
            wellbore.PurposeWellbore = job.Wellbore.WellborePurpose;

            var result = await witsmlClient.UpdateInStoreAsync(witsmlWellbore);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Wellbore updated ({wellbore.Name} [{wellbore.Uid}])");
                var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Wellbore.WellUid, job.Wellbore.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            var updatedWellbores = await witsmlClient.GetFromStoreAsync(witsmlWellbore, new OptionsIn(ReturnElements.IdOnly));
            var updatedWellbore = updatedWellbores.Wellbores.First();
            var description = new EntityDescription
            {
                WellName = updatedWellbore.NameWell,
                WellboreName = updatedWellbore.Name
            };
            Log.Error("Job failed. An error occurred when modifying wellbore: {Wellbore}", job.Wellbore.PrintProperties());
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update wellbore", result.Reason, description), null);
        }

        private void Verify(Wellbore wellbore)
        {
            if (string.IsNullOrEmpty(wellbore.Name)) throw new InvalidOperationException($"{nameof(wellbore.Name)} cannot be empty");
        }
    }
}
