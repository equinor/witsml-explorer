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
    public class ModifyWellWorker : BaseWorker<ModifyWellJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        public JobType JobType => JobType.ModifyWell;

        public ModifyWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job)
        {
            Verify(job.Well);

            var wellUid = job.Well.Uid;
            var wellName = job.Well.Name;
            var witsmlWellToUpdate = WellQueries.UpdateWitsmlWell(job.Well);

            var result = await witsmlClient.UpdateInStoreAsync(witsmlWellToUpdate);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Well updated ({wellName} [{wellUid}])");
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), job.Well.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            var updatedWells = await witsmlClient.GetFromStoreAsync(witsmlWellToUpdate, new OptionsIn(ReturnElements.IdOnly));
            var updatedWell = updatedWells.Wells.First();
            var description = new EntityDescription
            {
                WellName = updatedWell.Name
            };
            Log.Error("Job failed. An error occurred when modifying well: {Well}", job.Well.PrintProperties());
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update well", result.Reason, description), null);
        }

        private void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Name)) throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
        }
    }
}
