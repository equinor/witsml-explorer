using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class SpliceLogsWorker : BaseWorker<SpliceLogsJob>, IWorker
    {
        public JobType JobType => JobType.SpliceLogs;
        private enum ProgressType { Splice, CreateLog }

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

            try
            {
                VerifyLogHeaders(logHeaders);

                bool isDepthLog = logHeaders.Logs.FirstOrDefault().IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                WitsmlLogData newLogData = new()
                {
                    MnemonicList = string.Join(CommonConstants.DataSeparator, newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic)),
                    UnitList = string.Join(CommonConstants.DataSeparator, newLogHeader.LogCurveInfo.Select(lci => lci.Unit)),
                    Data = new() // Will be populated in the loop below
                };

                int totalIterations = logHeaders.Logs.SelectMany(l => l.LogCurveInfo.Skip(1)).Count();
                int currentIteration = 0;
                foreach (string logUid in logUids)
                {
                    WitsmlLog logHeader = logHeaders.Logs.Find(l => l.Uid == logUid);
                    foreach (var mnemonic in logHeader.LogCurveInfo.Select(lci => lci.Mnemonic).Skip(1))
                    {
                        WitsmlLogData logData = await LogWorkerTools.GetLogDataForCurve(GetTargetWitsmlClientOrThrow(), logHeader, mnemonic, Logger);
                        newLogData = SpliceLogDataForCurve(newLogData, logData, mnemonic, isDepthLog);
                        currentIteration++;
                        double progress = (double)currentIteration / totalIterations;
                        ReportProgress(job, ProgressType.Splice, progress);
                    }
                }

                await CreateNewLog(newLogHeader);
                await AddDataToLog(job, wellUid, wellboreUid, newLogUid, newLogData);
            }
            catch (ArgumentException e)
            {
                var message = $"SpliceLogsJob failed. Description: {job.Description()}. Error: {e.Message} ";
                Logger.LogError(message);
                return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
            }

            Logger.LogInformation("{JobType} - Job successful", GetType().Name);

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, $"Spliced logs: {job.GetObjectName()} to log: {newLogName}", jobId: jobId);
            RefreshObjects refreshAction = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), wellUid, wellboreUid, EntityType.Log);
            return (workerResult, refreshAction);
        }

        private static void ReportProgress(SpliceLogsJob job, ProgressType progressType, double tentativeProgress)
        {
            var progress = progressType switch
            {
                ProgressType.Splice => tentativeProgress * 0.8,
                ProgressType.CreateLog => 0.8 + tentativeProgress * 0.2,
                _ => throw new ArgumentOutOfRangeException(nameof(progressType), progressType, null)
            };
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

        private static WitsmlLogData SpliceLogDataForCurve(WitsmlLogData primaryData, WitsmlLogData secondaryData, string mnemonic, bool isDepthLog)
        {
            int mnemonicIndex = primaryData.MnemonicList.Split(CommonConstants.DataSeparator).ToList().FindIndex(m => m == mnemonic);
            Dictionary<string, string> primaryDict = primaryData.Data?.ToDictionary(row => row.Data.Split(CommonConstants.DataSeparator)[0], row => row.Data) ?? new();
            string startIndex = null;
            string endIndex = null;
            if (primaryDict.Any())
            {
                var firstElementForCurve = primaryDict.FirstOrDefault(x => x.Value.Split(CommonConstants.DataSeparator)[mnemonicIndex] != string.Empty);
                startIndex = firstElementForCurve.Equals(default(KeyValuePair<string, string>)) ? null : firstElementForCurve.Key;
                var lastElementForCurve = primaryDict.LastOrDefault(x => x.Value.Split(CommonConstants.DataSeparator)[mnemonicIndex] != string.Empty);
                endIndex = lastElementForCurve.Equals(default(KeyValuePair<string, string>)) ? null : lastElementForCurve.Key;
            }

            foreach (var dataRow in secondaryData.Data.Select(row => row.Data))
            {
                var rowIndex = dataRow.Split(CommonConstants.DataSeparator).First();
                if ((startIndex == null && endIndex == null)
                    || isDepthLog && (StringHelpers.ToDouble(rowIndex) < StringHelpers.ToDouble(startIndex) || StringHelpers.ToDouble(rowIndex) > StringHelpers.ToDouble(endIndex))
                    || !isDepthLog && (DateTime.Parse(rowIndex) < DateTime.Parse(startIndex) || DateTime.Parse(rowIndex) > DateTime.Parse(endIndex)))
                {
                    var newCellValue = dataRow.Split(CommonConstants.DataSeparator).Last();
                    var currentRowValue = (primaryDict.GetValueOrDefault(rowIndex)?.Split(CommonConstants.DataSeparator) ?? Enumerable.Repeat("", primaryData.MnemonicList.Split(CommonConstants.DataSeparator).Length)).ToList();
                    currentRowValue[0] = rowIndex;
                    currentRowValue[mnemonicIndex] = newCellValue;
                    primaryDict[rowIndex] = string.Join(CommonConstants.DataSeparator, currentRowValue);
                }
            }

            var sorted = isDepthLog ? primaryDict.OrderBy(x => StringHelpers.ToDouble(x.Key)) : primaryDict.OrderBy(x => DateTime.Parse(x.Key));
            List<WitsmlData> splicedData = sorted.Select(x => new WitsmlData { Data = x.Value }).ToList();

            WitsmlLogData newData = new()
            {
                MnemonicList = primaryData.MnemonicList,
                UnitList = primaryData.UnitList,
                Data = splicedData
            };

            return newData;
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

        private async Task AddDataToLog(SpliceLogsJob job, string wellUid, string wellboreUid, string logUid, WitsmlLogData data)
        {
            var batchSize = 5000; // Use maxDataNodes and maxDataPoints to calculate batchSize when supported by the API.
            var dataRows = data.Data;
            for (int i = 0; i < dataRows.Count; i += batchSize)
            {
                var currentLogData = dataRows.Skip(i).Take(batchSize).ToList();
                WitsmlLogs copyNewCurvesQuery = CreateAddLogDataRowsQuery(wellUid, wellboreUid, logUid, data, currentLogData);
                QueryResult result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(copyNewCurvesQuery), Logger);
                if (!result.IsSuccessful) throw new ArgumentException($"Could not add log data to the new log. {result.Reason}");
                ReportProgress(job, ProgressType.CreateLog, (i + batchSize) / (double)dataRows.Count);
            }
        }

        private static WitsmlLogs CreateAddLogDataRowsQuery(string wellUid, string wellboreUid, string logUid, WitsmlLogData logData, List<WitsmlData> currentLogData)
        {
            return new()
            {
                Logs = new List<WitsmlLog> {
                    new(){
                        UidWell = wellUid,
                        UidWellbore = wellboreUid,
                        Uid = logUid,
                        LogData = new WitsmlLogData
                        {
                            MnemonicList = logData.MnemonicList,
                            UnitList = logData.UnitList,
                            Data = currentLogData
                        }
                    }
                }
            };
        }
    }
}
