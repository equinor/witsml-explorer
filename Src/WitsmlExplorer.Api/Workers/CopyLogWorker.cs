using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class CopyLogWorker : BaseWorker<CopyLogJob>, IWorker
    {
        private readonly IWitsmlClient witsmlClient;
        private readonly IWitsmlClient witsmlSourceClient;
        private readonly ICopyLogDataWorker copyLogDataWorker;
        public JobType JobType => JobType.CopyLog;

        public CopyLogWorker(ILogger<CopyLogJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker = null) : base(logger)
        {
            witsmlClient = witsmlClientProvider.GetClient();
            witsmlSourceClient = witsmlClientProvider.GetSourceClient() ?? witsmlClient;
            this.copyLogDataWorker = copyLogDataWorker ?? new CopyLogDataWorker(witsmlClientProvider);
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(CopyLogJob job)
        {
            var (sourceLogs, targetWellbore) = await FetchSourceLogsAndTargetWellbore(job);
            var copyLogsQuery = sourceLogs.Select(log => CreateCopyLogQuery(log, targetWellbore));
            var copyLogTasks = copyLogsQuery.Select(logToCopy => witsmlClient.AddToStoreAsync(logToCopy));

            Task copyLogTasksResult = Task.WhenAll(copyLogTasks);
            await copyLogTasksResult;

            if (copyLogTasksResult.Status == TaskStatus.Faulted)
            {
                var errorMessage = "Failed to copy log.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            var copyLogDataJobs = sourceLogs.Select(log => CreateCopyLogDataJob(job, log));
            var copyLogDataTasks = copyLogDataJobs.Select(copyLogDataJob => copyLogDataWorker.Execute(copyLogDataJob));

            Task copyLogDataResultTask = Task.WhenAll(copyLogDataTasks);
            await copyLogDataResultTask;

            if (copyLogDataResultTask.Status == TaskStatus.Faulted)
            {
                var errorMessage = "Failed to copy log data.";
                Logger.LogError("{errorMessage} - {job.Description()}", errorMessage, job.Description());
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage), null);
            }

            Logger.LogInformation("{JobType} - Job successful. {Description}", GetType().Name, job.Description());
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            var copiedLogsMessage = sourceLogs.Length == 1 ? $"Log object {sourceLogs[0].Name}" : $"{sourceLogs.Length} logs" + $" copied to: {targetWellbore.Name}";
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, copiedLogsMessage);

            return (workerResult, refreshAction);
        }

        private async Task<Tuple<WitsmlLog[], WitsmlWellbore>> FetchSourceLogsAndTargetWellbore(CopyLogJob job)
        {
            var sourceLogReferenceList = job.Source.LogReferenceList;
            var getLogFromSourceQueries = Task.WhenAll(sourceLogReferenceList.Select(logReference => WorkerTools.GetLog(witsmlSourceClient, logReference, ReturnElements.All)));
            var getTargetWellboreQuery = WorkerTools.GetWellbore(witsmlClient, job.Target);

            await Task.WhenAll(getLogFromSourceQueries, getTargetWellboreQuery);

            var sourceLogs = await getLogFromSourceQueries;
            var targetWellbore = await getTargetWellboreQuery;
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
            var copyLogQuery = new WitsmlLogs { Logs = new List<WitsmlLog> { log } };
            return copyLogQuery;
        }

        private static Stream CreateCopyLogDataJob(CopyLogJob job, WitsmlLog targetLog)
        {
            var sourceLogReference = new LogReference
            {
                WellUid = job.Source.LogReferenceList.FirstOrDefault()?.WellUid,
                WellboreUid = job.Source.LogReferenceList.FirstOrDefault()?.WellboreUid,
                LogUid = targetLog.Uid
            };

            var targetLogReference = new LogReference
            {
                WellUid = job.Target.WellUid,
                WellboreUid = job.Target.WellboreUid,
                LogUid = targetLog.Uid
            };

            var copyLogDataJob = new CopyLogDataJob
            {
                Source = new LogCurvesReference
                {
                    LogReference = sourceLogReference,
                    Mnemonics = targetLog.LogData.MnemonicList.Split(",")
                },
                Target = targetLogReference
            };
            var json = JsonSerializer.Serialize(copyLogDataJob, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            return new MemoryStream(Encoding.UTF8.GetBytes(json));
        }

    }
}
