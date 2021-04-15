using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Witsml;
using Witsml.Data;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public interface IBatchModifyWellWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(BatchModifyWellJob job);
    }

    public class BatchModifyWellWorker : IBatchModifyWellWorker
    {
        private readonly IWitsmlClient witsmlClient;

        public BatchModifyWellWorker(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyWellJob job)
        {
            Verify(job.Wells);
            var queries = WellUpdateQueries.UpdateQuery(job.Wells);
            var UpdateWellTasks = new List<Task>();

            foreach(WitsmlWells query in queries)
            {
                UpdateWellTasks.Add(witsmlClient.UpdateInStoreAsync(query));
            }

            Task resultTask = Task.WhenAll(UpdateWellTasks);
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

        private void Verify(Well[] wells)
        {
            if (wells == null || wells.Length == 0) throw new InvalidOperationException("payload cannot be empty");
        }        
    }
}
