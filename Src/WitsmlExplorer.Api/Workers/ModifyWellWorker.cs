using System;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IModifyWellWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job);
    }

    public class ModifyWellWorker: IModifyWellWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public ModifyWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(ModifyWellJob job)
        {
            Verify(job.Well);
            var wellUid = job.Well.Uid;
            var wellName = job.Well.Name;
            var query = CreateUpdateQuery(job.Well);

            var result = await witsmlClient.UpdateInStoreAsync(query);
            if (result.IsSuccessful)
            {
                Log.Information("{JobType} - Job successful", GetType().Name);
                var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Well updated ({wellName} [{wellUid}])");
                var refreshAction = new RefreshWell(witsmlClient.GetServerHostname(), job.Well.Uid, RefreshType.Update);
                return (workerResult, refreshAction);
            }

            var updatedWells = await witsmlClient.GetFromStoreAsync(query, OptionsIn.IdOnly);
            var updatedWell = updatedWells.Wells.First();
            var description = new EntityDescription
            {
                WellName = updatedWell.Name
            };
            Log.Error($"Job failed. An error occurred when modifying well: {job.Well.PrintProperties()}");
            return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to update well", result.Reason, description), null);
        }

        private void Verify(Well well)
        {
            if (string.IsNullOrEmpty(well.Name)) throw new InvalidOperationException($"{nameof(well.Name)} cannot be empty");
        }

        private static WitsmlWells CreateUpdateQuery(Well well)
        {
            return new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = well.Uid,
                    Name = well.Name,
                    Field = well.Field,
                    TimeZone = well.TimeZone,
                    Country = well.Country,
                    Operator = well.Operator
                }.AsSingletonList()
            };
        }
    }
}
