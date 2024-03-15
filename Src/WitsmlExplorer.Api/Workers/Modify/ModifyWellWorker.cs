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

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyWellWorker : BaseWorker<ModifyWellJob>, IWorker
    {
        public JobType JobType => JobType.ModifyWell;

        public ModifyWellWorker(ILogger<ModifyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job.Well);

            string wellUid = job.Well.Uid;
            string wellName = job.Well.Name;
            WitsmlWells witsmlWellToUpdate = WellQueries.UpdateWitsmlWell(job.Well);

            QueryResult result = await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(witsmlWellToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Well modified. {jobDescription}", job.Description());
                WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Well updated ({wellName} [{wellUid}])");
                RefreshWell refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Well.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            WitsmlWells updatedWells = await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(witsmlWellToUpdate, new OptionsIn(ReturnElements.IdOnly));
            WitsmlWell updatedWell = updatedWells.Wells.First();
            EntityDescription description = new()
            {
                WellName = updatedWell.Name
            };
            const string errorMessage = "Failed to update well";
            Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, result.Reason, description), null);
        }

        private static void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Name))
            {
                throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
            }
        }
    }
}
