using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers.Copy;
using WitsmlExplorer.Api.Workers.Delete;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class OffsetLogCurveWorker : BaseWorker<OffsetLogCurveJob>, IWorker
    {
        public JobType JobType => JobType.OffsetLogCurves;
        private readonly ICopyLogDataWorker _copyLogDataWorker;
        private readonly IDeleteObjectsWorker _deleteObjectsWorker;

        public OffsetLogCurveWorker(ILogger<OffsetLogCurveJob> logger, IWitsmlClientProvider witsmlClientProvider, ICopyLogDataWorker copyLogDataWorker, IDeleteObjectsWorker deleteObjectsWorker) : base(witsmlClientProvider, logger)
        {
            _copyLogDataWorker = copyLogDataWorker;
            _deleteObjectsWorker = deleteObjectsWorker;
        }

        public override async Task<(WorkerResult, RefreshAction)> Execute(OffsetLogCurveJob job, CancellationToken? cancellationToken = null)
        {
            ComponentReferences logCurveInfoReferences = job.LogCurveInfoReferences;
            ObjectReference logReference = logCurveInfoReferences.Parent;
            double depthOffset = job.DepthOffset ?? 0;
            TimeSpan timeOffset = TimeSpan.FromMilliseconds(job.TimeOffsetMilliseconds ?? 0);
            bool useBackup = job.UseBackup;

            Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

            try
            {
                WitsmlLog log = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), logReference, ReturnElements.HeaderOnly) ?? throw new ArgumentException("Failed to find log");
                bool isDepthLog = log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
                Index startIndex = Index.Start(log, job.StartIndex);
                Index endIndex = Index.End(log, job.EndIndex);
                List<WitsmlLogCurveInfo> logCurveInfos = log.LogCurveInfo.Where(lci => logCurveInfoReferences.ComponentUids.Contains(lci.Mnemonic)).ToList();

                ObjectReference backupReference = null;
                if (useBackup)
                {
                    backupReference = await CreateTemporaryBackupOrThrow(job, log);
                }

                double totalIterations = logCurveInfos.Count * 2;
                for (int i = 0; i < logCurveInfos.Count; i++)
                {
                    var logCurveInfo = logCurveInfos[i];
                    WitsmlLogData logData = await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), log, logCurveInfo.Mnemonic, Logger, startIndex, endIndex);
                    WitsmlLogData offsetLogData = OffsetLogData(logData, depthOffset, timeOffset, isDepthLog);
                    await DeleteLogData(log, logCurveInfo, startIndex, endIndex);
                    ReportProgress(job, ((i * 2) + 1) / totalIterations);
                    await UpdateLogData(log, logCurveInfo, offsetLogData);
                    ReportProgress(job, ((i * 2) + 2) / totalIterations);
                }

                if (useBackup)
                {
                    await DeleteTemporaryBackup(backupReference);
                }
            }
            catch (Exception e)
            {
                var message = $"{JobType} failed. Description: {job.Description()}. Error: {e.Message} ";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message, job.JobInfo.Id), null);
            }

            Logger.LogInformation("Finished {JobType}. {jobDescription}", JobType, job.Description());

            RefreshAction refreshAction = new RefreshObjects(GetTargetWitsmlClientOrThrow().GetServerHostname(), logReference.WellUid, logReference.WellboreUid, EntityType.Log, logReference.Uid);
            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Successfully offset curves {string.Join(", ", logCurveInfoReferences.ComponentUids)}", null, null, job.JobInfo.Id);

            return (workerResult, refreshAction);
        }

        private async Task<ObjectReference> CreateTemporaryBackupOrThrow(OffsetLogCurveJob job, WitsmlLog log)
        {

            WitsmlLog backupLog = new()
            {
                UidWell = log.UidWell,
                UidWellbore = log.UidWellbore,
                Uid = $"{log.Uid}-tempbackup",
                NameWell = log.NameWell,
                NameWellbore = log.NameWellbore,
                Name = $"{log.Name}-tempbackup",
                IndexType = log.IndexType,
                IndexCurve = log.IndexCurve,
                Direction = log.Direction,
                LogCurveInfo = log.LogCurveInfo.Find(lci => lci.Mnemonic == log.IndexCurve.Value).AsItemInList()
            };
            var createLogResult = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(backupLog.AsItemInWitsmlList());
            if (!createLogResult.IsSuccessful)
            {
                throw new Exception("Failed to create temporary backup. No values were attempted to offset.");
            }

            ObjectReference backupReference = new ObjectReference()
            {
                WellUid = backupLog.UidWell,
                WellboreUid = backupLog.UidWellbore,
                Uid = backupLog.Uid,
                WellName = backupLog.NameWell,
                WellboreName = backupLog.NameWellbore,
                Name = backupLog.Name
            };

            CopyLogDataJob backupJob = new()
            {
                StartIndex = job.StartIndex,
                EndIndex = job.EndIndex,
                Source = job.LogCurveInfoReferences,
                Target = backupReference
            };

            (WorkerResult result, _) = await _copyLogDataWorker.Execute(backupJob);
            if (result.IsSuccess)
            {
                return backupReference;
            }
            throw new Exception("Failed add data to temporary backup. No values were attempted to offset.");
        }

        private async Task DeleteTemporaryBackup(ObjectReference backupReference)
        {
            DeleteObjectsJob deleteJob = new()
            {
                ToDelete = new ObjectReferences
                {
                    WellUid = backupReference.WellUid,
                    WellboreUid = backupReference.WellboreUid,
                    ObjectUids = new string[] { backupReference.Uid },
                    ObjectType = EntityType.Log
                }
            };
            (WorkerResult result, _) = await _deleteObjectsWorker.Execute(deleteJob);
            if (!result.IsSuccess)
            {
                throw new Exception("Failed to delete the temporary backup after successfully offsetting the values.");
            }
        }

        private static void ReportProgress(OffsetLogCurveJob job, double progress)
        {
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
            job.ProgressReporter?.Report(progress);
        }

        private async Task DeleteLogData(WitsmlLog log, WitsmlLogCurveInfo logCurveInfo, Index startIndex, Index endIndex)
        {
            var query = LogQueries.DeleteLogCurveContent(log.UidWell, log.UidWellbore, log.Uid, log.IndexType, logCurveInfo.AsItemInList(), startIndex, endIndex);
            var result = await GetTargetWitsmlClientOrThrow().DeleteFromStoreAsync(query);
            if (!result.IsSuccessful)
            {
                throw new Exception($"Failed to delete log data for mnemonic {logCurveInfo.Mnemonic}");
            }
        }

        private async Task UpdateLogData(WitsmlLog log, WitsmlLogCurveInfo logCurveinfo, WitsmlLogData offsetLogData)
        {
            var mnemonics = offsetLogData.MnemonicList.Split(CommonConstants.DataSeparator).ToList();
            var chunkMaxSize = await GetMaxBatchSize(mnemonics.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);
            var mnemonicList = offsetLogData.MnemonicList;

            var queries = LogWorkerTools.GetUpdateLogDataQueries(log.Uid, log.UidWell, log.UidWellbore, offsetLogData, chunkMaxSize, mnemonicList);
            foreach (var query in queries)
            {

                var result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query), Logger);
                if (!result.IsSuccessful)
                {
                    throw new Exception($"Failed to update log data for mnemonic {logCurveinfo.Mnemonic}. {result.Reason}.");
                }
            }
        }

        private static WitsmlLogData OffsetLogData(WitsmlLogData logData, double depthOffset, TimeSpan timeOffset, bool isDepthLog)
        {
            List<WitsmlData> offsetLogData = new();

            foreach (WitsmlData data in logData.Data)
            {
                string stringIndex = data.Data.Split(",").FirstOrDefault() ?? throw new Exception($"Failed to extract index from log data: {data.Data}");
                string offsetIndex = isDepthLog
                    ? OffsetDepthIndex(stringIndex, depthOffset)
                    : OffsetTimeIndex(stringIndex, timeOffset);

                offsetLogData.Add(
                    new WitsmlData
                    {
                        Data = $"{offsetIndex}{data.Data.Substring(stringIndex.Length)}"
                    }
                );
            }

            return new WitsmlLogData()
            {
                MnemonicList = logData.MnemonicList,
                UnitList = logData.UnitList,
                Data = offsetLogData
            };
        }

        private static string OffsetDepthIndex(string stringIndex, double depthOffset)
        {
            if (!double.TryParse(stringIndex, NumberStyles.Any, CultureInfo.InvariantCulture, out var index))
            {
                throw new Exception($"Failed to parse index to double: {stringIndex}");
            }

            string offsetIndex = ((decimal)index + (decimal)depthOffset).ToString(CultureInfo.InvariantCulture); // Use decimal for higher precision to reduce floating point errors

            return offsetIndex;
        }

        private static string OffsetTimeIndex(string stringIndex, TimeSpan timeOffset)
        {
            if (!DateTime.TryParse(stringIndex, out DateTime index))
            {
                throw new Exception($"Failed to parse index to TimeSpan: {stringIndex}");
            }

            return index.Add(timeOffset).ToISODateTimeString();
        }
    }
}
