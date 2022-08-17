using System;
using System.Linq;
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
    public class ModifyWellWorker : BaseWorker<ModifyWellJob>, IWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyWell;

        public ModifyWellWorker(ILogger<ModifyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job)
        {
            Verify(job.Well);

            var wellUid = job.Well.Uid;
            var wellName = job.Well.Name;
            var witsmlWellToUpdate = WellQueries.UpdateWitsmlWell(job.Well);

            var result = await _witsmlClient.UpdateInStoreAsync(witsmlWellToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Well modified. {jobDescription}", job.Description());
                var workerResult = new WorkerResult(_witsmlClient.GetServerHostname(), true, $"Well updated ({wellName} [{wellUid}])");
                var refreshAction = new RefreshWell(_witsmlClient.GetServerHostname(), job.Well.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            var updatedWells = await _witsmlClient.GetFromStoreAsync(witsmlWellToUpdate, new OptionsIn(ReturnElements.IdOnly));
            var updatedWell = updatedWells.Wells.First();
            var description = new EntityDescription
            {
                WellName = updatedWell.Name
            };
            const string errorMessage = "Failed to update well";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Name)) throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
        }
    }
}
