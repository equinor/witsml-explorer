using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null);
    }

    public class CopyLogWorker : BaseWorker<CopyObjectsJob>, IWorker, ICopyLogWorker
    {

        private readonly ICopyLogDataWorker _copyLogDataWorker;
        public JobType JobType => JobType.CopyLog;

        public CopyLogWorker(ILogger<CopyObjectsJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker = null, IDocumentRepository<Server, Guid> witsmlServerRepository = null) : base(witsmlClientProvider, logger)
        {
            _copyLogDataWorker = copyLogDataWorker ?? new CopyLogDataWorker(witsmlClientProvider, null, witsmlServerRepository);
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyObjectsJob job, CancellationToken? cancellationToken = null)
        {
            (WitsmlLog[] sourceLogs, WitsmlWellbore targetWellbore) = await FetchSourceLogsAndTargetWellbore(job);
            ICollection<WitsmlLog> copyLogsQuery = ObjectQueries.CopyObjectsQuery(sourceLogs, targetWellbore);
            List<Task<QueryResult>> copyLogTasks = copyLogsQuery.Select(logToCopy => GetTargetWitsmlClientOrThrow().AddToStoreAsync(logToCopy.AsItemInWitsmlList())).ToList();

            Task<QueryResult[]> copyLogTasksResult = Task.WhenAll(copyLogTasks);
            ICollection<QueryResult> results = await copyLogTasksResult;

            string errorMessage = "Failed to copy log.";
            if (copyLogTasksResult.Status == TaskStatus.Faulted)
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage), null);
            }
            if (results.Any((result) => !result.IsSuccessful))
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, copyLogTasks.First((task) => !task.Result.IsSuccessful).Result.Reason), null);
            }

            IEnumerable<CopyLogDataJob> copyLogDataJobs = sourceLogs.Select(log => CreateCopyLogDataJob(job, log));
            List<Task<(WorkerResult, RefreshAction)>> copyLogDataTasks = copyLogDataJobs.Select(x => _copyLogDataWorker.Execute(x, cancellationToken)).ToList();

            Task<(WorkerResult Result, RefreshAction)[]> copyLogDataResultTask = Task.WhenAll(copyLogDataTasks);
            await copyLogDataResultTask;

            if (copyLogDataResultTask.Status == TaskStatus.Faulted)
            {
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage), null);
            }

            int failedCopyDataTasks = copyLogDataResultTask.Result.Count((task) => task.Result.IsSuccess == false);
            if (failedCopyDataTasks > 0)
            {
                (WorkerResult Result, RefreshAction) firstFailedTask = copyLogDataResultTask.Result.First((task) => task.Result.IsSuccess == false);
                errorMessage = $"Failed to copy log data for {failedCopyDataTasks} out of {copyLogDataTasks.Count()} logs.";
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, firstFailedTask.Result.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, EntityType.Log);
            string copiedLogsMessage = (sourceLogs.Length == 1 ? $"Copied log object {sourceLogs[0].Name}" : $"Copied {sourceLogs.Length} logs") + $" to: {targetWellbore.Name}";
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, copiedLogsMessage);

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlLog[], WitsmlWellbore>> FetchSourceLogsAndTargetWellbore(CopyObjectsJob job)
        {
            string[] logUids = job.Source.ObjectUids;
            Task<WitsmlLog[]> getLogFromSourceQueries = Task.WhenAll(logUids.Select(
                logUid => GetLogHeaderOnly(GetSourceWitsmlClientOrThrow(), logUid, job.Source.WellboreUid, job.Source.WellUid)).ToList());
            Task<WitsmlWellbore> getTargetWellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target, retry: true);

            await Task.WhenAll(getLogFromSourceQueries, getTargetWellboreQuery);

            WitsmlLog[] sourceLogs = await getLogFromSourceQueries;
            WitsmlWellbore targetWellbore = await getTargetWellboreQuery;
            return Tuple.Create(sourceLogs, targetWellbore);
        }

        private static async Task<WitsmlLog> GetLogHeaderOnly(IWitsmlClient client, string logUid, string wellboreUid, string wellUid)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
            return result.Logs?.FirstOrDefault();
        }

        private static CopyLogDataJob CreateCopyLogDataJob(CopyObjectsJob job, WitsmlLog targetLog)
        {
            ObjectReference sourceLogReference = new()
            {
                WellUid = job.Source.WellUid,
                WellboreUid = job.Source.WellboreUid,
                Uid = targetLog.Uid
            };

            ObjectReference targetLogReference = new()
            {
                WellUid = job.Target.WellUid,
                WellboreUid = job.Target.WellboreUid,
                Uid = targetLog.Uid
            };

            CopyLogDataJob copyLogDataJob = new()
            {
                Source = new ComponentReferences
                {
                    Parent = sourceLogReference,
                    ComponentUids = targetLog.LogCurveInfo.Select((lci) => lci.Mnemonic).ToArray()
                },
                Target = targetLogReference
            };
            return copyLogDataJob;
        }

    }
}
