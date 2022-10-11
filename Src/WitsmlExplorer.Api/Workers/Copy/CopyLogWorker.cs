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
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers.Copy
{
    public interface ICopyLogWorker
    {
        Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job);
    }

    public class CopyLogWorker : BaseWorker<CopyLogJob>, IWorker, ICopyLogWorker
    {
        private readonly IWitsmlClient _witsmlClient;
        private readonly IWitsmlClient _witsmlSourceClient;
        private readonly ICopyLogDataWorker _copyLogDataWorker;
        public JobType JobType => JobType.CopyLog;

        public CopyLogWorker(ILogger<CopyLogJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker = null) : base(logger)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
            _witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? throw new WitsmlClientProviderException("Missing WitsmlSource in CopyJob", 500);
            _copyLogDataWorker = copyLogDataWorker ?? new CopyLogDataWorker(witsmlClientProvider);
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job)
        {
            (WitsmlLog[] sourceLogs, WitsmlWellbore targetWellbore) = await FetchSourceLogsAndTargetWellbore(job);
            IEnumerable<WitsmlLogs> copyLogsQuery = sourceLogs.Select(log => CreateCopyLogQuery(log, targetWellbore));
            IEnumerable<Task<QueryResult>> copyLogTasks = copyLogsQuery.Select(logToCopy => _witsmlClient.AddToStoreAsync(logToCopy));

            Task copyLogTasksResult = Task.WhenAll(copyLogTasks);
            await copyLogTasksResult;

            if (copyLogTasksResult.Status == TaskStatus.Faulted)
            {
                string errorMessage = "Failed to copy log.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            IEnumerable<CopyLogDataJob> copyLogDataJobs = sourceLogs.Select(log => CreateCopyLogDataJob(job, log));
            IEnumerable<Task<(WorkerResult, RefreshAction)>> copyLogDataTasks = copyLogDataJobs.Select(copyLogDataJob => _copyLogDataWorker.Execute(copyLogDataJob));

            Task copyLogDataResultTask = Task.WhenAll(copyLogDataTasks);
            await copyLogDataResultTask;

            if (copyLogDataResultTask.Status == TaskStatus.Faulted)
            {
                string errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(_witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            RefreshWellbore refreshAction = new(_witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            string copiedLogsMessage = (sourceLogs.Length == 1 ? $"Copied log object {sourceLogs[0].Name}" : $"Copied {sourceLogs.Length} logs") + $" to: {targetWellbore.Name}";
            WorkerResult workerResult = new(_witsmlClient.GetServerHostname(), true, copiedLogsMessage);

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlLog[], WitsmlWellbore>> FetchSourceLogsAndTargetWellbore(CopyLogJob job)
        {
            string[] logUids = job.Source.ObjectUids;
            Task<WitsmlLog[]> getLogFromSourceQueries = Task.WhenAll(logUids.Select(
                logUid => WorkerTools.GetLog(_witsmlSourceClient, logUid, job.Source.WellboreUid, job.Source.WellUid, ReturnElements.All)));
            Task<WitsmlWellbore> getTargetWellboreQuery = WorkerTools.GetWellbore(_witsmlClient, job.Target);

            await Task.WhenAll(getLogFromSourceQueries, getTargetWellboreQuery);

            WitsmlLog[] sourceLogs = await getLogFromSourceQueries;
            WitsmlWellbore targetWellbore = await getTargetWellboreQuery;
            return Tuple.Create(sourceLogs, targetWellbore);
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
                Source = new LogCurvesReference
                {
                    LogReference = sourceLogReference,
                    Mnemonics = targetLog.LogData.MnemonicList.Split(",")
                },
                Target = targetLogReference
            };
            return copyLogDataJob;
        }

    }
}
