using System;
using System.Collections.Generic;
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
            var (log, targetWellbore) = await FetchData(job);
            var copyLogQuery = CreateCopyLogQuery(log, targetWellbore);
            var copyLogResult = await witsmlClient.AddToStoreAsync(copyLogQuery);
            if (!copyLogResult.IsSuccessful)
            {
                var errorMessage = "Failed to copy log.";
                LogError(job, errorMessage);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyLogResult.Reason), null);
            }

            var copyLogDataJob = CreateCopyLogDataJob(job, log);
            var copyLogDataResult = await copyLogDataWorker.Execute(copyLogDataJob);
            if (!copyLogDataResult.Item1.IsSuccess)
            {
                var errorMessage = "Failed to copy log data.";
                LogError(job, errorMessage);
                return (new WorkerResult(witsmlClient.GetServerHostname(), false, errorMessage, copyLogResult.Reason), null);
            }

            Log.Information("{JobType} - Job successful. Log object copied", GetType().Name);
            var refreshAction = new RefreshWellbore(witsmlClient.GetServerHostname(), job.Target.WellUid, job.Target.WellboreUid, RefreshType.Update);
            var workerResult = new WorkerResult(witsmlClient.GetServerHostname(), true, $"Log object {log.Name} copied to: {targetWellbore.Name}");

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
            var referenceForNewLog = new LogReference
            {
                WellUid = job.Target.WellUid,
                WellboreUid = job.Target.WellboreUid,
                LogUid = job.Source.LogUid
            };
            var copyLogDataJob = new CopyLogDataJob
            {
                LogCurvesReference = new LogCurvesReference
                {
                    LogReference = job.Source,
                    Mnemonics = log.LogData.MnemonicList.Split(",")
                },
                Target = referenceForNewLog
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

        private async Task<Tuple<WitsmlLog, WitsmlWellbore>> FetchData(CopyLogJob job)
        {
            var logQuery = GetLog(witsmlSourceClient, job.Source);
            var wellboreQuery = GetWellbore(witsmlClient, job.Target);
            await Task.WhenAll(logQuery, wellboreQuery);
            var log = await logQuery;
            var targetWellbore = await wellboreQuery;
            return Tuple.Create(log, targetWellbore);
        }

        private static async Task<WitsmlLog> GetLog(IWitsmlClient client, LogReference logReference)
        {
            var logQuery = LogQueries.GetWitsmlLogById(logReference.WellUid, logReference.WellboreUid, logReference.LogUid);
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
