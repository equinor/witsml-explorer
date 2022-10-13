using System;
using System.Linq;
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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.ModifyWell;

        public ModifyWellWorker(ILogger<ModifyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient().Result;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job)
        {
            Verify(job.Well);

            string wellUid = job.Well.Uid;
            string wellName = job.Well.Name;
            WitsmlWells witsmlWellToUpdate = WellQueries.UpdateWitsmlWell(job.Well);

            QueryResult result = await _witsmlClient.UpdateInStoreAsync(witsmlWellToUpdate);
            if (result.IsSuccessful)
            {
                Logger.LogInformation("Well modified. {jobDescription}", job.Description());
                WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, $"Well updated ({wellName} [{wellUid}])");
                RefreshWell refreshAction = new(_witsmlClient.GetServerHostname(), job.Well.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            WitsmlWells updatedWells = await _witsmlClient.GetFromStoreAsync(witsmlWellToUpdate, new OptionsIn(ReturnElements.IdOnly));
            WitsmlWell updatedWell = updatedWells.Wells.First();
            EntityDescription description = new()
            {
                WellName = updatedWell.Name
            };
            const string errorMessage = "Failed to update well";
            Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
            return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage, result.Reason, description), null);
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
