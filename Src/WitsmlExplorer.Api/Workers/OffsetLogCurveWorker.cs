using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class OffsetLogCurveWorker : BaseWorker<OffsetLogCurveJob>, IWorker
    {
        public JobType JobType => JobType.OffsetLogCurves;

        public OffsetLogCurveWorker(ILogger<OffsetLogCurveJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(OffsetLogCurveJob job, CancellationToken? cancellationToken = null)
        {
            ComponentReferences logCurveInfoReferences = job.LogCurveInfoReferences;
            ObjectReference logReference = logCurveInfoReferences.Parent;
            double depthOffset = job.DepthOffset ?? 0;
            TimeSpan timeOffset = TimeSpan.FromMilliseconds(job.TimeOffsetMilliseconds ?? 0);

            Logger.LogInformation("Started {JobType}. {jobDescription}", JobType, job.Description());

            try
            {
                WitsmlLog log = await LogWorkerTools.GetLog(GetTargetWitsmlClientOrThrow(), logReference, ReturnElements.HeaderOnly) ?? throw new ArgumentException("Failed to find log");
                bool isDepthLog = log.IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;
                Index startIndex = Index.Start(log, job.StartIndex);
                Index endIndex = Index.End(log, job.EndIndex);
                List<WitsmlLogCurveInfo> logCurveInfos = log.LogCurveInfo.Where(lci => logCurveInfoReferences.ComponentUids.Contains(lci.Mnemonic)).ToList();

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
            var queries = GetUpdateLogDataQueries(log, offsetLogData);
            foreach (var query in queries)
            {

                var result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query), Logger);
                if (!result.IsSuccessful)
                {
                    throw new Exception($"Failed to update log data for mnemonic {logCurveinfo.Mnemonic}");
                }
            }
        }

        private static List<WitsmlLogs> GetUpdateLogDataQueries(WitsmlLog log, WitsmlLogData offsetLogData)
        {
            int chunkSize = 5000; // TODO: Base this on maxDataNodes/maxDataPoints once issue #1957 is implemented.
            List<WitsmlLogs> batchedQueries = offsetLogData.Data.Chunk(chunkSize).Select(chunk =>
                new WitsmlLogs
                {
                    Logs = new WitsmlLog
                    {
                        Uid = log.Uid,
                        UidWell = log.UidWell,
                        UidWellbore = log.UidWellbore,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = offsetLogData.MnemonicList,
                            UnitList = offsetLogData.UnitList,
                            Data = chunk.ToList(),
                        }
                    }.AsItemInList()
                }
            ).ToList();

            return batchedQueries;
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

            return $"{index + depthOffset}";
        }

        private static string OffsetTimeIndex(string stringIndex, TimeSpan timeOffset)
        {
            if (!DateTime.TryParse(stringIndex, out DateTime index))
            {
                throw new Exception($"Failed to parse index to TimeSpan: {stringIndex}");
            }

            return $"{index.Add(timeOffset).ToISODateTimeString()}";
        }
    }
}
