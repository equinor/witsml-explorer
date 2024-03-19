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
using WitsmlExplorer.Api.Models.Reports;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class BatchModifyObjectsOnSearchWorker : BaseWorker<BatchModifyObjectsOnSearchJob>, IWorker
    {
        public JobType JobType => JobType.BatchModifyObjectsOnSearch;

        public BatchModifyObjectsOnSearchWorker(ILogger<BatchModifyObjectsOnSearchJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(BatchModifyObjectsOnSearchJob job, CancellationToken? cancellationToken = null)
        {
            List<ObjectOnWellbore> objects = job.Objects;
            EntityType objectType = job.ObjectType;

            Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

            objects = objects.Select(obj => ModifyUtils.PrepareModification(obj, objectType, Logger)).ToList();

            try
            {
                objects.ForEach(ModifyUtils.VerifyModification);
            }
            catch (Exception e)
            {
                Logger.LogError("{JobType} - Job validation failed", JobType);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, "Job validation failed", e.Message, null, job.JobInfo.Id), null);
            }

            List<IWitsmlQueryType> queries = objects.Select(obj => obj.ToWitsml()).ToList();
            List<Task<QueryResult>> modifyResults = queries.Select(query => GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query)).ToList();
            List<QueryResult> results = (await Task.WhenAll(modifyResults)).ToList();

            var report = CreateReport(objects, results);
            job.JobInfo.Report = report;

            if (results.Any(result => !result.IsSuccessful))
            {
                string errorMessage = $"Failed to modify some {objectType}s";
                var reason = "Inspect the report for details";
                Logger.LogError("{ErrorMessage}. {jobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, reason, null, job.JobInfo.Id), null);
            }

            Logger.LogInformation("{objectType} modified. {jobDescription}", objectType, job.Description());

            var refreshAction = new BatchRefreshObjects(GetTargetWitsmlClientOrThrow().GetServerHostname(), objectType, JobType, objects);

            var workerResult = new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"{objects.Count} objects of type {objectType} batch updated", null, null, job.JobInfo.Id);

            return (workerResult, refreshAction);
        }

        private static BatchModifyReport CreateReport(List<ObjectOnWellbore> objects, List<QueryResult> results)
        {
            var reportItems = objects.Select((obj, index) => new BatchModifyReportItem
            {
                WellUid = obj.WellUid,
                WellboreUid = obj.WellboreUid,
                Uid = obj.Uid,
                IsSuccessful = results[index].IsSuccessful ? "Yes" : "No",
                FailureReason = results[index].IsSuccessful ? "" : results[index].Reason
            }).ToList();

            return new BatchModifyReport
            {
                Title = "Batch Update Report",
                Summary = $"Updated {objects.Count} objects",
                WarningMessage = results.Any(result => !result.IsSuccessful) ? "Some objects were not modified. Inspect the reasons below." : null,
                ReportItems = reportItems
            };
        }
    }
}
