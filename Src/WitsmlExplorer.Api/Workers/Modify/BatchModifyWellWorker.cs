using System;
using System.Collections.Generic;
using System.Linq;
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
        private readonly IWitsmlClient _witsmlClient;
        public JobType JobType => JobType.BatchModifyWell;

        public BatchModifyWellWorker(ILogger<BatchModifyWellJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyWellJob job)
        {
            Verify(job.Wells);

            IEnumerable<WitsmlWells> wellsToUpdate = job.Wells.Select(WellQueries.UpdateWitsmlWell);
            IEnumerable<Task<QueryResult>> updateWellTasks = wellsToUpdate.Select(wellToUpdate => _witsmlClient.UpdateInStoreAsync(wellToUpdate));

            Task resultTask = Task.WhenAll(updateWellTasks);
            await resultTask;

            if (resultTask.Status == TaskStatus.Faulted)
            {
                const string errorMessage = "Failed to batch update well properties";
                Logger.LogError("{ErrorMessage}. {jobDescription}}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            Logger.LogInformation("Wells modified. {jobDescription}", job.Description());
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, "Batch updated well properties");
            string[] wells = job.Wells.Select(well => well.Uid).ToArray();
            RefreshWells refreshAction = new(_witsmlClient.GetServerHostname(), wells, RefreshType.BatchUpdate);
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
