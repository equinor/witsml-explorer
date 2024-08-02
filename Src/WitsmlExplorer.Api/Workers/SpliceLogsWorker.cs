using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

using CurveIndex = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Workers
{
    public class SpliceLogsWorker : BaseWorker<SpliceLogsJob>, IWorker
    {
        public JobType JobType => JobType.SpliceLogs;

        public SpliceLogsWorker(ILogger<SpliceLogsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }

        public override async Task<(WorkerResult, RefreshAction)> Execute(SpliceLogsJob job, CancellationToken? cancellationToken = null)
        {
            string wellUid = job.Logs.WellUid;
            string wellboreUid = job.Logs.WellboreUid;
            string[] logUids = job.Logs.ObjectUids;
            string jobId = job.JobInfo.Id;
            string newLogName = job.NewLogName;
            string newLogUid = job.NewLogUid;

            WitsmlLogs logHeaders = await GetLogHeaders(wellUid, wellboreUid, logUids);
            WitsmlLog newLogHeader = CreateNewLogQuery(logHeaders, newLogUid, newLogName);
            string currentMnemonic = "";
            string currentLogUid = "";

            try
            {
                VerifyLogHeaders(logHeaders);

                bool isDepthLog = logHeaders.Logs.FirstOrDefault().IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                string indexCurve = newLogHeader.IndexCurve.Value;
                string indexCurveUnit = newLogHeader.LogCurveInfo.FirstOrDefault().Unit;

                int totalIterations = logHeaders.Logs.SelectMany(l => l.LogCurveInfo.Skip(1)).Count();
                int currentIteration = 0;

                await CreateNewLog(newLogHeader);

                foreach (var mnemonic in newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic).Skip(1)) // Skip the index curve
                {
                    currentMnemonic = mnemonic;
                    string mnemonicUnit = newLogHeader.LogCurveInfo.FirstOrDefault(lci => lci.Mnemonic == mnemonic).Unit;
                    WitsmlLogData newLogData = new()
                    {
                        MnemonicList = indexCurve + CommonConstants.DataSeparator + mnemonic,
                        UnitList = indexCurveUnit + CommonConstants.DataSeparator + mnemonicUnit,
                        Data = new() // Will be populated in the loop below
                    };

                    foreach (string logUid in logUids)
                    {
                        currentLogUid = logUid;
                        cancellationToken?.ThrowIfCancellationRequested();
                        WitsmlLog logHeader = logHeaders.Logs.Find(l => l.Uid == logUid);
                        if (logHeader.LogCurveInfo.Any(lci => lci.Mnemonic == mnemonic))
                        {
                            if (newLogData.Data.Count == 0)
                            {
                                newLogData.Data = (await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), logHeader, mnemonic, Logger)).Data;
                            }
                            else
                            {
                                string startIndex = GetStartIndexOfData(newLogData, mnemonic);
                                string endIndex = GetEndIndexOfData(newLogData, mnemonic);
                                WitsmlLogData logDataBefore = await GetLogDataForCurveBeforeIndex(logHeader, mnemonic, startIndex, isDepthLog);
                                WitsmlLogData logDataAfter = await GetLogDataForCurveAfterIndex(logHeader, mnemonic, endIndex, isDepthLog);
                                newLogData = SpliceLogDataForCurve(newLogData, logDataBefore, logDataAfter);
                            }
                            currentIteration++;
                            double progress = (double)currentIteration / totalIterations;
                            ReportProgress(job, progress);
                        }
                    }

                    await AddDataToLog(wellUid, wellboreUid, newLogUid, newLogData);

                    Logger.LogDebug("{JobType} - Added {Mnemonic} to spliced log. Progress: {CurrentIteration}/{TotalIterations}", GetType().Name, mnemonic, currentIteration, totalIterations);
                }

            }
            catch (Exception e)
            {
                var message = $"SpliceLogsJob failed. Description: {job.Description()}. CurrentMnemonic: {currentMnemonic}, currentLogUid: {currentLogUid}";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message, e.Message, jobId: jobId), null);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Spliced logs: {job.GetObjectName()} to log: {newLogName}", jobId: jobId);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Log);
            return (workerResult, refreshAction);
        }

        private static void ReportProgress(SpliceLogsJob job, double progress)
        {
            if (job.JobInfo != null) job.JobInfo.Progress = progress;
            job.ProgressReporter?.Report(progress);
        }

        private async Task<WitsmlLogs> GetLogHeaders(string wellUid, string wellboreUid, string[] logUids)
        {
            return await LogWorkerTools.GetLogsByIds(GetTargetWitsmlClientOrThrow(), wellUid, wellboreUid, logUids, ReturnElements.HeaderOnly);
        }

        private static void VerifyLogHeaders(WitsmlLogs logHeaders)
        {
            if (logHeaders.Logs.IsNullOrEmpty()) throw new ArgumentException("Log headers could not be fetched");
            var isIncreasing = logHeaders.Logs.FirstOrDefault().IsIncreasing();
            if (logHeaders.Logs.Any(log => log.IsIncreasing() != isIncreasing)) throw new ArgumentException("Direction must match for all logs");
            var indexType = logHeaders.Logs.FirstOrDefault().IndexType;
            if (logHeaders.Logs.Any(log => log.IndexType != indexType)) throw new ArgumentException("Index type must match for all logs");
        }

        private static string GetStartIndexOfData(WitsmlLogData logData, string mnemonic)
        {
            int mnemonicIndex = logData.MnemonicList.Split(CommonConstants.DataSeparator).ToList().FindIndex(m => m == mnemonic);
            WitsmlData firstDataRow = logData.Data?.FirstOrDefault(x => x.Data.Split(CommonConstants.DataSeparator)[mnemonicIndex] != string.Empty);
            return firstDataRow?.Data?.Split(CommonConstants.DataSeparator)[0];
        }

        private static string GetEndIndexOfData(WitsmlLogData logData, string mnemonic)
        {
            int mnemonicIndex = logData.MnemonicList.Split(CommonConstants.DataSeparator).ToList().FindIndex(m => m == mnemonic);
            WitsmlData lastDataRow = logData.Data?.LastOrDefault(x => x.Data.Split(CommonConstants.DataSeparator)[mnemonicIndex] != string.Empty);
            return lastDataRow?.Data?.Split(CommonConstants.DataSeparator)[0];
        }

        private async Task<WitsmlLogData> GetLogDataForCurveBeforeIndex(WitsmlLog logHeader, string mnemonic, string startIndex, bool isDepthLog)
        {
            WitsmlLogCurveInfo logCurveInfo = logHeader.LogCurveInfo.FirstOrDefault(lci => lci.Mnemonic == mnemonic);
            CurveIndex mnemonicStartIndex;
            CurveIndex dataStartIndex;
            if (isDepthLog)
            {
                WitsmlIndex mnemonicMinIndex = logCurveInfo.MinIndex;
                mnemonicStartIndex = new DepthIndex(StringHelpers.ToDouble(mnemonicMinIndex.Value), mnemonicMinIndex.Uom);
                dataStartIndex = new DepthIndex(StringHelpers.ToDouble(startIndex), mnemonicMinIndex.Uom);
            }
            else
            {
                string mnemonicMinDateTimeIndex = logCurveInfo.MinDateTimeIndex;
                mnemonicStartIndex = new DateTimeIndex(DateTime.Parse(mnemonicMinDateTimeIndex));
                dataStartIndex = new DateTimeIndex(DateTime.Parse(startIndex));
            }

            if (mnemonicStartIndex < dataStartIndex)
            {
                WitsmlLogData logData = await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), logHeader, mnemonic, Logger, mnemonicStartIndex, dataStartIndex);
                if (logData?.Data.LastOrDefault()?.Data.Split(CommonConstants.DataSeparator)[0] == startIndex)
                {
                    // It returns the logData inclusive start and end index, but we want exclusive the end index.
                    logData.Data.RemoveAt(logData.Data.Count - 1);
                }
                return logData;
            }

            // No new data, so return an empty list
            return new WitsmlLogData
            {
                Data = new List<WitsmlData>()
            };
        }

        private async Task<WitsmlLogData> GetLogDataForCurveAfterIndex(WitsmlLog logHeader, string mnemonic, string endIndex, bool isDepthLog)
        {
            WitsmlLogCurveInfo logCurveInfo = logHeader.LogCurveInfo.FirstOrDefault(lci => lci.Mnemonic == mnemonic);
            CurveIndex mnemonicEndIndex;
            CurveIndex dataEndIndex;

            if (isDepthLog)
            {
                WitsmlIndex mnemonicMaxIndex = logCurveInfo.MaxIndex;
                mnemonicEndIndex = new DepthIndex(StringHelpers.ToDouble(mnemonicMaxIndex.Value), mnemonicMaxIndex.Uom);
                dataEndIndex = new DepthIndex(StringHelpers.ToDouble(endIndex), mnemonicMaxIndex.Uom);
            }
            else
            {
                string mnemonicMaxDateTimeIndex = logCurveInfo.MaxDateTimeIndex;
                mnemonicEndIndex = new DateTimeIndex(DateTime.Parse(mnemonicMaxDateTimeIndex));
                dataEndIndex = new DateTimeIndex(DateTime.Parse(endIndex));
            }

            if (mnemonicEndIndex > dataEndIndex)
            {
                WitsmlLogData logData = await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), logHeader, mnemonic, Logger, dataEndIndex, mnemonicEndIndex);
                if (logData?.Data.FirstOrDefault()?.Data.Split(CommonConstants.DataSeparator)[0] == endIndex)
                {
                    // It returns the logData inclusive start and end index, but we want exclusive the start index.
                    logData.Data.RemoveAt(0);
                }
                return logData;
            }

            // No new data, so return an empty list
            return new WitsmlLogData
            {
                Data = new List<WitsmlData>()
            };
        }

        private static WitsmlLogData SpliceLogDataForCurve(WitsmlLogData logData, WitsmlLogData logDataBefore, WitsmlLogData logDataAfter)
        {
            return new WitsmlLogData
            {
                MnemonicList = logData.MnemonicList,
                UnitList = logData.UnitList,
                Data = logDataBefore.Data
                    .Concat(logData.Data)
                    .Concat(logDataAfter.Data)
                    .ToList()
            };
        }

        private async Task CreateNewLog(WitsmlLog newLogHeader)
        {
            WitsmlLogs query = new()
            {
                Logs = newLogHeader.AsItemInList()
            };
            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(query);
            if (!result.IsSuccessful) throw new ArgumentException($"Could not create log. {result.Reason}");
        }

        private static WitsmlLog CreateNewLogQuery(WitsmlLogs logHeaders, string newLogUid, string newLogName)
        {
            // The main data should be taken from the first log, but LogCurveInfo and IndexCurve should be taken from the last log.
            WitsmlLog baseLog = logHeaders.Logs.FirstOrDefault();
            return new()
            {
                Name = newLogName,
                NameWell = baseLog.NameWell,
                NameWellbore = baseLog.NameWellbore,
                Uid = newLogUid,
                UidWell = baseLog.UidWell,
                UidWellbore = baseLog.UidWellbore,
                IndexType = baseLog.IndexType,
                IndexCurve = logHeaders.Logs.LastOrDefault().IndexCurve,
                Direction = baseLog.Direction,
                LogCurveInfo = GetNewLogCurveInfo(logHeaders)
            };
        }

        private static List<WitsmlLogCurveInfo> GetNewLogCurveInfo(WitsmlLogs logHeaders)
        {
            // Returns the LogCurveInfo where curves from the last logs are prioritized.
            // The index curve from the last log is also placed first in the new LogCurveInfo.
            var indexLogCurveInfo = logHeaders.Logs.LastOrDefault().LogCurveInfo.FirstOrDefault();
            List<WitsmlLogCurveInfo> otherLogCurveInfos = logHeaders.Logs.SelectMany(log => log.LogCurveInfo.Skip(1)).ToList(); // Skip index curve of each log.
            var newLogCurveInfo = otherLogCurveInfos
                    .GroupBy(x => x.Mnemonic)
                    .Select(g => g.Last())
                    .Prepend(indexLogCurveInfo)
                    .ToList();
            return newLogCurveInfo;
        }

        private async Task AddDataToLog(string wellUid, string wellboreUid, string logUid, WitsmlLogData data)
        {
            var mnemonics = data.MnemonicList.Split(CommonConstants.DataSeparator).ToList();
            var chunkMaxSize = await GetMaxBatchSize(mnemonics.Count, CommonConstants.WitsmlFunctionType.WMLSUpdateInStore, CommonConstants.WitsmlQueryTypeName.Log);
            var mnemonicList = data.MnemonicList;
            var queries = LogWorkerTools.GetUpdateLogDataQueries(logUid, wellUid, wellboreUid, data, chunkMaxSize, mnemonicList);

            foreach (var query in queries)
            {
                QueryResult result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(query), Logger);
                if (!result.IsSuccessful) throw new ArgumentException($"Could not add log data to the new log. {result.Reason}");
            }
        }
    }
}
