using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyLogWorker : IWorker<CopyLogJob>
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        private readonly IWorker<CopyLogDataJob> copyLogDataWorker;

        public CopyLogWorker(IWitsmlClientProvider witsmlClientProvider, IWorker<CopyLogDataJob> copyLogDataWorker = null)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
            this.copyLogDataWorker = copyLogDataWorker ?? new CopyLogDataWorker(witsmlClientProvider);
        }

        public async Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job)
        {
            var (logs, targetWellbore) = await FetchData(job);
            var copyLogsQuery = logs.Select(log => CreateCopyLogQuery(log, targetWellbore));
            var copyLogTasks = copyLogsQuery.Select(logToCopy => witsmlClient.AddToStoreAsync(logToCopy));

            Task copyLogTasksResult = Task.WhenAll(copyLogTasks);
            await copyLogTasksResult;

            if (copyLogTasksResult.Status == TaskStatus.Faulted)
            {
                var errorMessage = "Failed to copy log.";
                LogError(job, errorMessage);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            var copyLogDataJobs = logs.Select(log => CreateCopyLogDataJob(job, log));
            var copyLogDataTasks = copyLogDataJobs.Select(copyLogDataJob => copyLogDataWorker.Execute(copyLogDataJob));

            Task copyLogDataResultTask = Task.WhenAll(copyLogDataTasks);
            await copyLogDataResultTask;

            if (copyLogDataResultTask.Status == TaskStatus.Faulted)
            {
                var errorMessage = "Failed to copy log data.";
                LogError(job, errorMessage);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            Log.Information("{JobType} - Job successful. Log object copied", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            var copiedLogsMessage = logs.Length == 1 ? $"Log object {logs[0].Name}" : $"{logs.Length} logs" + $" copied to: {targetWellbore.Name}";
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, copiedLogsMessage);

            return (workerResult, refreshAction);
        }

        private static void LogError(CopyLogJob job, string errorMessage)
        {
            Log.Error("{ErrorMessage} " +
                      "Source: UidWell: {SourceWellUid}, UidWellbore: {SourceWellboreUid}, Uid: {SourceLogUid}. " +
                      "Target: UidWell: {TargetWellUid}, UidWellbore: {TargetWellboreUid}",
                errorMessage,
                job.Source.WellUid, job.Source.WellboreUid, job.Source.LogUid,
                job.Target.WellUid, job.Target.WellboreUid);
        }

        private static CopyLogDataJob CreateCopyLogDataJob(CopyLogJob job, WitsmlLog log)
        {
            var sourceLogReference = job.Source;
            sourceLogReference.LogUid = log.Uid;

            var targetLogReference = new LogReference
            {
                WellUid = job.Target.WellUid,
                WellboreUid = job.Target.WellboreUid,
                LogUid = log.Uid
            };

            var copyLogDataJob = new CopyLogDataJob
            {
                LogCurvesReference = new LogCurvesReference
                {
                    LogReference = sourceLogReference,
                    Mnemonics = log.LogData.MnemonicList.Split(",")
                },
                Target = targetLogReference
            };
            return copyLogDataJob;
        }

        private static WitsmlLogs CreateCopyLogQuery(WitsmlLog log, WitsmlWellbore targetWellbore)
        {
            log.UidWell = targetWellbore.UidWell;
            log.NameWell = targetWellbore.NameWell;
            log.UidWellbore = targetWellbore.Uid;
            log.NameWellbore = targetWellbore.Name;
            log.CommonData.ItemState = string.IsNullOrEmpty(log.CommonData.ItemState) ? null : log.CommonData.ItemState;
            log.CommonData.SourceName = string.IsNullOrEmpty(log.CommonData.SourceName) ? null : log.CommonData.SourceName;
            log.LogData.Data = new List<WitsmlData>();
            var copyLogQuery = new WitsmlLogs { Logs = new List<WitsmlLog> { log } };
            return copyLogQuery;
        }

        private async Task<Tuple<WitsmlLog[], WitsmlWellbore>> FetchData(CopyLogJob job)
        {
            var logQueries = Task.WhenAll(job.Source.CheckedLogUids.Select(checkedLog => GetLog(witsmlSourceClient, job.Source, checkedLog)));
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);

            await Task.WhenAll(logQueries, wellboreQuery);

            var logs = await logQueries;
            var targetWellbore = await wellboreQuery;
            return Tuple.Create(logs, targetWellbore);
        }

        private static async Task<WitsmlLog> GetLog(IWitsmlClient client, LogReference logReference, string checkedLog)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, checkedLog);
            var result = await client.GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.All));
            return !result.Logs.Any() ? null : result.Logs.First();
        }

        private static async Task<WitsmlWellbore> GetWellbore(IWitsmlClient client, WellboreReference wellboreReference)
        {
            var query = WellboreQueries.GetWitsmlWellboreByUid(wellboreReference.WellUid, wellboreReference.WellboreUid);
            var wellbores = await client.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return !wellbores.Wellbores.Any() ? null : wellbores.Wellbores.First();
        }
    }
}
