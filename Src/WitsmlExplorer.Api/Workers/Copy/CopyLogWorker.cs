using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job);
    }

    public class CopyLogWorker : BaseWorker<CopyLogJob>, IWorker, ICopyLogWorker
    {

        private readonly ICopyLogDataWorker _copyLogDataWorker;
        public JobType JobType => JobType.CopyLog;

        public CopyLogWorker(ILogger<CopyLogJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker = null) : base(witsmlClientProvider, logger)
        {
            _copyLogDataWorker = copyLogDataWorker ?? new CopyLogDataWorker(witsmlClientProvider);
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job)
        {
            (WitsmlLog[] sourceLogs, WitsmlWellbore targetWellbore) = await FetchSourceLogsAndTargetWellbore(job);
            IEnumerable<WitsmlLogs> copyLogsQuery = sourceLogs.Select(log => CreateCopyLogQuery(log, targetWellbore));
            IEnumerable<Task<QueryResult>> copyLogTasks = copyLogsQuery.Select(logToCopy => GetTargetWitsmlClientOrThrow().AddToStoreAsync(logToCopy));

            Task copyLogTasksResult = Task.WhenAll(copyLogTasks);
            await copyLogTasksResult;

            if (copyLogTasksResult.Status == TaskStatus.Faulted)
            {
                string errorMessage = "Failed to copy log.";
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage), null);
            }

            IEnumerable<CopyLogDataJob> copyLogDataJobs = sourceLogs.Select(log => CreateCopyLogDataJob(job, log));
            IEnumerable<Task<(WorkerResult, RefreshAction)>> copyLogDataTasks = copyLogDataJobs.Select(_copyLogDataWorker.Execute);

            Task<(WorkerResult Result, RefreshAction)[]> copyLogDataResultTask = Task.WhenAll(copyLogDataTasks);
            await copyLogDataResultTask;

            if (copyLogDataResultTask.Status == TaskStatus.Faulted)
            {
                string errorMessage = "Failed to copy log data.";
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage), null);
            }

            int failedCopyDataTasks = copyLogDataResultTask.Result.Count((task) => task.Result.IsSuccess == false);
            if (failedCopyDataTasks > 0)
            {
                (WorkerResult Result, RefreshAction) firstFailedTask = copyLogDataResultTask.Result.First((task) => task.Result.IsSuccess == false);
                string errorMessage = $"Failed to copy log data for {failedCopyDataTasks} out of {copyLogDataTasks.Count()} logs.";
                Logger.LogError("{ErrorMessage} - {JobDescription}", errorMessage, job.Description());
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, errorMessage, firstFailedTask.Result.Reason), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshLogObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            string copiedLogsMessage = (sourceLogs.Length == 1 ? $"Copied log object {sourceLogs[0].Name}" : $"Copied {sourceLogs.Length} logs") + $" to: {targetWellbore.Name}";
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, copiedLogsMessage);

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlLog[], WitsmlWellbore>> FetchSourceLogsAndTargetWellbore(CopyLogJob job)
        {
            string[] logUids = job.Source.ObjectUids;
            Task<WitsmlLog[]> getLogFromSourceQueries = Task.WhenAll(logUids.Select(
                logUid => GetLogHeaderOnly(GetSourceWitsmlClientOrThrow(), logUid, job.Source.WellboreUid, job.Source.WellUid)));
            Task<WitsmlWellbore> getTargetWellboreQuery = WorkerTools.GetWellbore(GetTargetWitsmlClientOrThrow(), job.Target);

            await Task.WhenAll(getLogFromSourceQueries, getTargetWellboreQuery);

            WitsmlLog[] sourceLogs = await getLogFromSourceQueries;
            WitsmlWellbore targetWellbore = await getTargetWellboreQuery;
            return Tuple.Create(sourceLogs, targetWellbore);
        }

        private static async Task<WitsmlLog> GetLogHeaderOnly(IWitsmlClient client, string logUid, string wellboreUid, string wellUid)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

        private static WitsmlLogs CreateCopyLogQuery(WitsmlLog log, WitsmlWellbore targetWellbore)
        {
            log.UidWell = targetWellbore.UidWell;
            log.NameWell = targetWellbore.NameWell;
            log.UidWellbore = targetWellbore.Uid;
            log.NameWellbore = targetWellbore.Name;
            log.CommonData.ItemState = string.IsNullOrEmpty(log.CommonData.ItemState) ? null : log.CommonData.ItemState;
            log.CommonData.SourceName = string.IsNullOrEmpty(log.CommonData.SourceName) ? null : log.CommonData.SourceName;
            WitsmlLogs copyLogQuery = new() { Logs = new List<WitsmlLog> { log } };
            return copyLogQuery;
        }

        private static CopyLogDataJob CreateCopyLogDataJob(CopyLogJob job, WitsmlLog targetLog)
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
