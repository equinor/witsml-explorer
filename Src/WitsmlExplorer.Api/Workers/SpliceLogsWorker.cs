using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class SpliceLogsWorker : BaseWorker<SpliceLogsJob>, IWorker
    {
        public JobType JobType => JobType.SpliceLogs;

        public SpliceLogsWorker(ILogger<SpliceLogsJob> logger, IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider, logger) { }
        public override async Task<(WorkerResult, RefreshAction)> Execute(SpliceLogsJob job)
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

                bool isDescending = logHeaders.Logs.FirstOrDefault().Direction == WitsmlLog.WITSML_DIRECTION_DECREASING;
                bool isDepthLog = logHeaders.Logs.FirstOrDefault().IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD;

                WitsmlLogData newLogData = new()
                {
                    MnemonicList = string.Join(",", newLogHeader.LogCurveInfo.Select(lci => lci.Mnemonic)),
                    UnitList = string.Join(",", newLogHeader.LogCurveInfo.Select(lci => lci.Unit)),
                    Data = new() // Will be populated in the loop below
                };

                foreach (string logUid in logUids)
                {
                    WitsmlLog logHeader = logHeaders.Logs.Find(l => l.Uid == logUid);
                    foreach (var mnemonic in logHeader.LogCurveInfo.Select(lci => lci.Mnemonic).Skip(1))
                    {
                        WitsmlLogData logData = await GetLogDataForCurve(logHeader, mnemonic);
                        newLogData = SpliceLogDataForCurve(newLogData, logData, mnemonic, isDescending, isDepthLog);
                    }
                }

                await CreateNewLog(newLogHeader);
                await AddDataToLog(wellUid, wellboreUid, newLogUid, newLogData);
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

        private async Task<WitsmlLogs> GetLogHeaders(string wellUid, string wellboreUid, string[] logUids)
        {
            WitsmlLogs logQuery = LogQueries.GetWitsmlLogsByIds(wellUid, wellboreUid, logUids);
            return await GetTargetWitsmlClientOrThrow().GetFromStoreAsync(logQuery, new OptionsIn(ReturnElements.HeaderOnly));
        }

        private static void VerifyLogHeaders(WitsmlLogs logHeaders)
        {
            if (logHeaders.Logs.IsNullOrEmpty()) throw new ArgumentException("Log headers could not be fetched");
            var indexCurve = logHeaders.Logs.FirstOrDefault().IndexCurve;
            if (logHeaders.Logs.Any(log => log.IndexCurve.Value != indexCurve.Value)) throw new ArgumentException("IndexCurve must match for all logs");
            var direction = logHeaders.Logs.FirstOrDefault().Direction;
            if (logHeaders.Logs.Any(log => log.Direction != direction)) throw new ArgumentException("Direction must match for all logs");
            var indexType = logHeaders.Logs.FirstOrDefault().IndexType;
            if (logHeaders.Logs.Any(log => log.IndexType != indexType)) throw new ArgumentException("Index type must match for all logs");
        }

        private async Task<WitsmlLogData> GetLogDataForCurve(WitsmlLog log, string mnemonic)
        {
            await using LogDataReader logDataReader = new(GetTargetWitsmlClientOrThrow(), log, mnemonic.AsSingletonList(), Logger);
            List<WitsmlData> data = new();
            WitsmlLogData logData = await logDataReader.GetNextBatch();
            var mnemonicList = logData?.MnemonicList;
            var unitList = logData?.UnitList;
            while (logData != null)
            {
                data.AddRange(logData.Data);
                logData = await logDataReader.GetNextBatch();
            }

            return new WitsmlLogData
            {
                MnemonicList = mnemonicList,
                UnitList = unitList,
                Data = data
            };
        }

        private static WitsmlLogData SpliceLogDataForCurve(WitsmlLogData primaryData, WitsmlLogData secondaryData, string mnemonic, bool isDescending, bool isDepthLog)
        {
            int mnemonicIndex = primaryData.MnemonicList.Split(',').ToList().FindIndex(m => m == mnemonic);
            Dictionary<string, string> primaryDict = primaryData.Data?.ToDictionary(row => row.Data.Split(',')[0], row => row.Data) ?? new();
            string startIndex = null;
            string endIndex = null;
            if (primaryDict.Any())
            {
                var firstElementForCurve = primaryDict.FirstOrDefault(x => x.Value.Split(',')[mnemonicIndex] != "");
                startIndex = firstElementForCurve.Equals(default(KeyValuePair<string, string>)) ? null : firstElementForCurve.Key;
                var lastElementForCurve = primaryDict.LastOrDefault(x => x.Value.Split(',')[mnemonicIndex] != "");
                endIndex = lastElementForCurve.Equals(default(KeyValuePair<string, string>)) ? null : lastElementForCurve.Key;
            }

            foreach (var dataRow in secondaryData.Data.Select(row => row.Data))
            {
                var rowIndex = dataRow.Split(',').First();
                if ((startIndex == null && endIndex == null)
                    || isDepthLog && (StringHelpers.ToDouble(rowIndex) < StringHelpers.ToDouble(startIndex) || StringHelpers.ToDouble(rowIndex) > StringHelpers.ToDouble(endIndex))
                    || !isDepthLog && (DateTime.Parse(rowIndex) < DateTime.Parse(startIndex) || DateTime.Parse(rowIndex) > DateTime.Parse(endIndex)))
                {
                    var newCellValue = dataRow.Split(',').Last();
                    var currentRowValue = (primaryDict.GetValueOrDefault(rowIndex)?.Split(',') ?? Enumerable.Repeat("", primaryData.MnemonicList.Split(',').Length)).ToList();
                    currentRowValue[0] = rowIndex;
                    currentRowValue[mnemonicIndex] = newCellValue;
                    primaryDict[rowIndex] = string.Join(",", currentRowValue);
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
                Logs = newLogHeader.AsSingletonList()
            };
            QueryResult result = await GetTargetWitsmlClientOrThrow().AddToStoreAsync(query);
            if (!result.IsSuccessful) throw new ArgumentException($"Could not create log. {result.Reason}");
        }

        private static WitsmlLog CreateNewLogQuery(WitsmlLogs logHeaders, string newLogUid, string newLogName)
        {
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
                IndexCurve = baseLog.IndexCurve,
                Direction = baseLog.Direction,
                LogCurveInfo = logHeaders.Logs
                    .SelectMany(log => log.LogCurveInfo)
                    .GroupBy(x => x.Mnemonic)
                    .Select(g => g.Last())
                    .ToList()
            };
        }

        private async Task AddDataToLog(string wellUid, string wellboreUid, string logUid, WitsmlLogData data)
        {
            var batchSize = 5000; // Use maxDataNodes and maxDataPoints to calculate batchSize when supported by the API.
            var dataRows = data.Data;
            for (int i = 0; i < dataRows.Count; i += batchSize)
            {
                var currentLogData = dataRows.Skip(i).Take(batchSize).ToList();
                WitsmlLogs copyNewCurvesQuery = CreateAddLogDataRowsQuery(wellUid, wellboreUid, logUid, data, currentLogData);
                QueryResult result = await RequestUtils.WithRetry(async () => await GetTargetWitsmlClientOrThrow().UpdateInStoreAsync(copyNewCurvesQuery), Logger);
                if (!result.IsSuccessful) throw new ArgumentException($"Could not add log data to the new log. {result.Reason}");
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
