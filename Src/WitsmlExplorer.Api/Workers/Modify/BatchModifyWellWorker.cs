using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class BatchModifyWellWorker : BaseWorker<BatchModifyWellJob>, IWorker
    {
        public JobType JobType => JobType.BatchModifyWell;

        public BatchModifyWellWorker(ILogger<BatchModifyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyWellJob job, CancellationToken? cancellationToken = null)
        {
            Verify(job.Wells);

            IEnumerable<WitsmlWells> wellsToUpdate = job.Wells.Select(WellQueries.UpdateWitsmlWell);
            List<Task<QueryResult>> updateWellTasks = wellsToUpdate.Select(wellToUpdate => GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(wellToUpdate)).ToList();

            Task resultTask = Task.WhenAll(updateWellTasks);
            await resultTask;

            if (resultTask.Status == TaskStatus.Faulted)
            {
                const string errorMessage = "Failed to batch update well properties";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage), null);
            }

            Logger.LogInformation("Wells modified. {jobDescription}", job.Description());
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, "Batch updated well properties");
            string[] wells = job.Wells.Select(well => well.Uid).ToArray();
            RefreshWells refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wells, RefreshType.BatchUpdate);
            return (workerResult, refreshAction);
        }

        private static void Verify(IEnumerable<Well> wells)
        {
            if (!wells.Any())
            {
                throw new InvalidOperationException("payload cannot be empty");
            }
        }
    }
}
