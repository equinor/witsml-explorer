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
            var queries = job.Wells.Select(CreateUpdateQuery);
            var updateWellTasks = queries.Select(q => witsmlClient.UpdateInStoreAsync(q));

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
