using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class BatchModifyWellWorker : IWorker<BatchModifyWellJob>
    {
        private readonly IWitsmlClient witsmlClient;

        public BatchModifyWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyWellJob job)
        {
            Verify(job.Wells);

            var wellsToUpdate = job.Wells.Select(well => WellQueries.UpdateWitsmlWell(well));
            var updateWellTasks = wellsToUpdate.Select(wellToUpdate => witsmlClient.UpdateInStoreAsync(wellToUpdate));

            Task resultTask = Task.WhenAll(updateWellTasks);
            await resultTask;

            if (resultTask.Status == TaskStatus.Faulted)
            {
                Log.Error("Job failed. An error occurred when batch updating wells");
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, "Failed to batch update well properties"), null);
            }

            Log.Information("{JobType} - Job successful", GetType().Name);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, "Batch updated well properties");
            var wells = job.Wells.Select(well => well.Uid).ToArray();
            var refreshAction = new RefreshWells(witsmlClient.GetServerHostname(), wells, RefreshType.BatchUpdate);
            return (workerResult, refreshAction);
        }

        private void Verify(IEnumerable<Well> wells)
        {
            if (!wells.Any()) throw new InvalidOperationException("payload cannot be empty");
        }
    }
}
