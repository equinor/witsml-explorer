using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.IdentityModel.Tokens;

using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;
using WitsmlExplorer.Api.Workers;

using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Services
{
    public interface ILogObjectService
    {
        Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid);
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken = null);
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions, CancellationToken? cancellationToken = null);
        Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid);
        Task<ICollection<MultiLogCurveInfo>> GetMultiLogCurveInfo(string wellUid, string wellboreUid, IEnumerable<string> logUids);
        Task<LogData> GetMultiLogData(string wellUid, string wellboreUid, string startIndex, string endIndex, bool startIndexIsInclusive, Dictionary<string, List<string>> logMnemonics);
        Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end, bool loadAllData, CancellationToken? cancellationToken, IProgress<double> progressReporter = null);
    }

    // ReSharper disable once UnusedMember.Global
    public class LogObjectService : WitsmlService, ILogObjectService
    {
        public LogObjectService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }
        public async Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid)
        {
            WitsmlLogs witsmlLog = LogQueries.GetWitsmlLogsByWellbore(wellUid, wellboreUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(witsmlLog, new OptionsIn(ReturnElements.Requested));

            return result.Logs.Select(log =>
                new LogObject
                {
                    Uid = log.Uid,
                    Name = log.Name,
                    IndexType = log.IndexType,
                    WellUid = log.UidWell,
                    WellName = log.NameWell,
                    WellboreUid = log.UidWellbore,
                    WellboreName = log.NameWellbore,
                    ObjectGrowing = StringHelpers.ToBoolean(log.ObjectGrowing),
                    ServiceCompany = log.ServiceCompany,
                    RunNumber = log.RunNumber,
                    StartIndex = log.GetStartIndexAsString(),
                    EndIndex = log.GetEndIndexAsString(),
                    IndexCurve = log.IndexCurve.Value,
                    Direction = LogObject.ConvertDirection(log),
                    Mnemonics = log.LogCurveInfo.Count,
                    CommonData = new CommonData()
                    {
                        DTimCreation = log.CommonData.DTimCreation,
                        DTimLastChange = log.CommonData.DTimLastChange,
                    }
                }).OrderBy(log => log.Name).ToList();
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, CancellationToken? cancellationToken = null)
        {
            return await GetLog(wellUid, wellboreUid, logUid, new OptionsIn(ReturnElements.HeaderOnly), cancellationToken);
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions, CancellationToken? cancellationToken = null)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, queryOptions, cancellationToken);
            WitsmlLog witsmlLog = result.Logs.FirstOrDefault();
            if (witsmlLog == null)
            {
                return null;
            }

            LogObject logObject = new()
            {
                Uid = witsmlLog.Uid,
                Name = witsmlLog.Name,
                IndexType = witsmlLog.IndexType,
                WellUid = witsmlLog.UidWell,
                WellName = witsmlLog.NameWell,
                WellboreUid = witsmlLog.UidWellbore,
                WellboreName = witsmlLog.NameWellbore,
                IndexCurve = witsmlLog.IndexCurve.Value,
                ObjectGrowing = StringHelpers.ToBoolean(witsmlLog.ObjectGrowing),
                ServiceCompany = witsmlLog.ServiceCompany,
                RunNumber = witsmlLog.RunNumber,
                Direction = LogObject.ConvertDirection(witsmlLog),
                Mnemonics = witsmlLog.LogCurveInfo.Count,
                CommonData = new()
                {
                    DTimCreation = witsmlLog.CommonData.DTimCreation,
                    DTimLastChange = witsmlLog.CommonData.DTimLastChange,
                }
            };
            if (string.IsNullOrEmpty(witsmlLog.IndexType))
            {
                return logObject;
            }

            logObject.StartIndex = witsmlLog.GetStartIndexAsString();
            logObject.EndIndex = witsmlLog.GetEndIndexAsString();

            return logObject;
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            result.EnsureIndexCurveIsFirst();
            return result.Logs.FirstOrDefault();
        }

        public async Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            return witsmlLog?.LogCurveInfo.Select(logCurveInfo =>
                new LogCurveInfo
                {
                    Uid = logCurveInfo.Uid,
                    Mnemonic = logCurveInfo.Mnemonic,
                    ClassWitsml = logCurveInfo.ClassWitsml,
                    MaxDateTimeIndex = logCurveInfo.MaxDateTimeIndex,
                    MaxDepthIndex = logCurveInfo.MaxIndex?.Value,
                    MinDateTimeIndex = logCurveInfo.MinDateTimeIndex,
                    MinDepthIndex = logCurveInfo.MinIndex?.Value,
                    MnemAlias = logCurveInfo.MnemAlias,
                    SensorOffset = LengthMeasure.FromWitsml(logCurveInfo.SensorOffset),
                    Unit = logCurveInfo.Unit,
                    CurveDescription = logCurveInfo.CurveDescription,
                    TypeLogData = logCurveInfo.TypeLogData,
                    TraceState = logCurveInfo.TraceState,
                    NullValue = logCurveInfo.NullValue,
                    AxisDefinitions = logCurveInfo.AxisDefinitions?.Select(a => new AxisDefinition()
                    {
                        Uid = a.Uid,
                        Order = a.Order,
                        Count = a.Count,
                        DoubleValues = a.DoubleValues
                    }).ToList(),
                }).ToList();
        }

        public async Task<ICollection<MultiLogCurveInfo>> GetMultiLogCurveInfo(string wellUid, string wellboreUid, IEnumerable<string> logUids)
        {
            var logGetters = logUids.Select(logUid => GetMultiLogCurveInfo(wellUid, wellboreUid, logUid)).ToList();
            var resultTask = await Task.WhenAll(logGetters);
            var result = resultTask.SelectMany(i => i).ToList();
            return result;
        }

        public async Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end, bool loadAllData, CancellationToken? cancellationToken = null, IProgress<double> progressReporter = null)
        {
            WitsmlLog log = await GetLogHeader(wellUid, wellboreUid, logUid);

            Index startIndex = Index.Start(log, start);
            Index endIndex = Index.End(log, end);

            if ((!log.IsDecreasing() && startIndex > endIndex) || (log.IsDecreasing() && startIndex < endIndex))
            {
                return new LogData();
            }

            string indexMnemonic = log.IndexCurve.Value;
            if (!mnemonics.Contains(indexMnemonic))
            {
                mnemonics.Insert(0, indexMnemonic);
            }

            WitsmlLog witsmlLog = loadAllData ? await LoadDataRecursive(mnemonics, log, startIndex, endIndex, cancellationToken, wellUid, wellboreUid, logUid, progressReporter)
                : await LoadData(mnemonics, log, startIndex, endIndex, wellUid, wellboreUid, logUid);

            if (witsmlLog?.LogData == null || witsmlLog.LogData.Data.IsNullOrEmpty())
            {
                return new LogData();
            }

            if (!startIndexIsInclusive)
            {
                witsmlLog.LogData.Data.RemoveAt(0);
                if (witsmlLog.LogData.Data.Count == 0)
                {
                    return new LogData();
                }
            }

            List<CurveSpecification> curveSpecifications = log.LogCurveInfo
                .Where(lci => mnemonics.Contains(lci.Mnemonic))
                .Select(lci => new CurveSpecification { Mnemonic = lci.Mnemonic, Unit = lci.Unit ?? CommonConstants.Unit.Unitless })
                .ToList();

            return new LogData
            {
                StartIndex = witsmlLog.StartIndex == null ? startIndex.GetValueAsString() :
                Index.Start(witsmlLog).GetValueAsString(),
                EndIndex = witsmlLog.EndIndex == null ? endIndex.GetValueAsString() :
                Index.End(witsmlLog).GetValueAsString(),
                CurveSpecifications = curveSpecifications,
                Data = GetDataDictionary(witsmlLog.LogData)
            };
        }
        public async Task<LogData> GetMultiLogData(string wellUid, string wellboreUid, string startIndex, string endIndex, bool startIndexIsInclusive, Dictionary<string, List<string>> logMnemonics)
        {
            var logUids = logMnemonics.Keys.ToArray();
            var logsQuery = new WitsmlLogs
            {
                Logs = logUids.Select(logUid =>
                    new WitsmlLog
                    {
                        Uid = logUid,
                        UidWell = wellUid,
                        UidWellbore = wellboreUid,
                        Name = "",
                        IndexCurve = new WitsmlIndexCurve(),
                        IndexType = "",
                        StartIndex = new WitsmlIndex(),
                        EndIndex = new WitsmlIndex(),
                        Direction = ""
                    }
                ).ToList()
            };
            var logs = await _witsmlClient.GetFromStoreAsync(logsQuery, new OptionsIn(ReturnElements.Requested));

            if (logs.Logs.Count != logUids.Length) throw new DataException("Could not fetch all logs");
            var isIncreasing = logs.Logs.FirstOrDefault().IsIncreasing();
            if (logs.Logs.Any(log => log.IsIncreasing() != isIncreasing)) throw new DataException("Direction must match for all logs");
            var indexType = logs.Logs.FirstOrDefault().IndexType;
            if (logs.Logs.Any(log => log.IndexType != indexType)) throw new DataException("Index type must match for all logs");

            var logDataTasks = logMnemonics.Select(kvp => ReadLogData(wellUid, wellboreUid, kvp.Key, kvp.Value, startIndexIsInclusive, startIndex, endIndex, loadAllData: false, CancellationToken.None)).ToList();
            var data = (await Task.WhenAll(logDataTasks)).ToList();
            return MergeMultiLogData(data, logs.Logs);
        }

        private LogData MergeMultiLogData(List<LogData> logDatas, List<WitsmlLog> logs)
        {
            List<CurveSpecification> curveSpecifications = new();

            var indexCurveSpecification = logDatas.FirstOrDefault(l => l.CurveSpecifications != null)?.CurveSpecifications?.FirstOrDefault();
            if (indexCurveSpecification == null) return new(); // No data to show
            string newIndexCurve = indexCurveSpecification.Mnemonic;

            Dictionary<string, Dictionary<string, LogDataValue>> dataDict = new();

            for (int i = 0; i < logDatas.Count; i++)
            {
                LogData currentLogData = logDatas[i];
                if (currentLogData.Data == null) continue; // Skip if there is no data for a given log within the specified interval.
                string currentLogIndexCurve = currentLogData.CurveSpecifications.First().Mnemonic;
                string logUid = logs[i].Uid;

                foreach (var curveSpecification in currentLogData.CurveSpecifications.Skip(1)) // Skip the index curve as we only want it once
                {
                    curveSpecifications.Add(new CurveSpecification
                    {
                        Mnemonic = $"{curveSpecification.Mnemonic} [uid={logUid}]",
                        Unit = curveSpecification.Unit
                    });
                }

                foreach (var logData in currentLogData.Data)
                {
                    if (logData.Count > 0)
                    {
                        var indexValue = logData[currentLogIndexCurve].Value.ToString();
                        if (dataDict.ContainsKey(indexValue))
                        {
                            var updatedLogData = logData
                                .Where((kvp) => kvp.Key != currentLogIndexCurve) // Skip the index curve as it already exists
                                .Select(kvp => new KeyValuePair<string, LogDataValue>($"{kvp.Key} [uid={logUid}]", kvp.Value))
                                .ToDictionary();
                            dataDict[indexValue] = dataDict[indexValue].Concat(updatedLogData).ToDictionary();
                        }
                        else
                        {
                            var updatedLogData = logData
                                .Select(kvp => kvp.Key == currentLogIndexCurve
                                    ? new KeyValuePair<string, LogDataValue>(newIndexCurve, kvp.Value)
                                    : new KeyValuePair<string, LogDataValue>($"{kvp.Key} [uid={logUid}]", kvp.Value))
                                .ToDictionary();
                            dataDict[indexValue] = updatedLogData;
                        }
                    }
                }
            }

            var isTimeLog = logs.First().IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME;

            var newData = isTimeLog ? dataDict
                    .OrderBy(kvp => DateTime.Parse(kvp.Key))
                    .Select(kvp => kvp.Value)
                    .ToList()
                : dataDict
                    .OrderBy(kvp => StringHelpers.ToDouble(kvp.Key))
                    .Select(kvp => kvp.Value)
                    .ToList();

            var newCurveSpecifications = curveSpecifications.OrderBy(cs => cs.Mnemonic).ToList();
            newCurveSpecifications.Insert(0, indexCurveSpecification);

            LogData newLogData = new()
            {
                CurveSpecifications = newCurveSpecifications,
                Data = newData
            };

            return newLogData;
        }

        private async Task<ICollection<MultiLogCurveInfo>> GetMultiLogCurveInfo(string wellUid, string wellboreUid, string logUid)
        {
            WitsmlLog witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            return witsmlLog?.LogCurveInfo.Select(logCurveInfo =>
                new MultiLogCurveInfo
                {
                    Uid = logCurveInfo.Uid,
                    Mnemonic = logCurveInfo.Mnemonic,
                    LogUid = logUid,
                    ClassWitsml = logCurveInfo.ClassWitsml,
                    MaxDateTimeIndex = logCurveInfo.MaxDateTimeIndex,
                    MaxDepthIndex = logCurveInfo.MaxIndex?.Value,
                    MinDateTimeIndex = logCurveInfo.MinDateTimeIndex,
                    MinDepthIndex = logCurveInfo.MinIndex?.Value,
                    MnemAlias = logCurveInfo.MnemAlias,
                    SensorOffset = LengthMeasure.FromWitsml(logCurveInfo.SensorOffset),
                    Unit = logCurveInfo.Unit,
                    CurveDescription = logCurveInfo.CurveDescription,
                    TypeLogData = logCurveInfo.TypeLogData,
                    TraceState = logCurveInfo.TraceState,
                    NullValue = logCurveInfo.NullValue,
                    AxisDefinitions = logCurveInfo.AxisDefinitions?.Select(a => new AxisDefinition()
                    {
                        Uid = a.Uid,
                        Order = a.Order,
                        Count = a.Count,
                        DoubleValues = a.DoubleValues
                    }).ToList(),
                }).ToList();
        }

        private async Task<WitsmlLog> LoadData(List<string> mnemonics, WitsmlLog log, Index startIndex, Index endIndex, string wellUid = null, string wellboreUid = null, string logUid = null)
        {
            WitsmlLogs query = LogQueries.GetLogContent(wellUid, wellboreUid, logUid, log.IndexType, mnemonics, startIndex, endIndex);
            WitsmlLogs witsmlLogs = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            WitsmlLog witsmlLog = witsmlLogs.Logs?.FirstOrDefault();

            return witsmlLog;
        }

        private async Task<WitsmlLog> LoadDataRecursive(List<string> mnemonics, WitsmlLog log, Index startIndex, Index endIndex, CancellationToken? cancellationToken = null, string wellUid = null, string wellboreUid = null, string logUid = null, IProgress<double> progressReporter = null)
        {
            await using LogDataReader logDataReader = new(_witsmlClient, log, new List<string>(mnemonics), null, startIndex, endIndex);
            WitsmlLogData logData = await logDataReader.GetNextBatch(cancellationToken);
            var allLogData = logData;
            while (logData != null)
            {
                if (progressReporter != null)
                {
                    double progress = LogWorkerTools.CalculateProgressBasedOnIndex(log, logData, startIndex, endIndex);
                    progressReporter.Report(progress);
                }
                logData = await logDataReader.GetNextBatch(cancellationToken);
                if (logData != null) allLogData.Data.AddRange(logData.Data);
            }

            var witsmlLog = new WitsmlLog();
            witsmlLog.LogData = allLogData;
            return witsmlLog;
        }

        private static ICollection<Dictionary<string, LogDataValue>> GetDataDictionary(WitsmlLogData logData)
        {
            List<Dictionary<string, LogDataValue>> result = new();
            string[] mnemonics = logData.MnemonicList.Split(CommonConstants.DataSeparator);
            foreach (string valueRow in logData.Data.Select(d => d.Data))
            {
                var keyValuePairs = valueRow.Split(CommonConstants.DataSeparator).Select((value, index) => new { index, value }).ToList();
                if (keyValuePairs.Count > mnemonics.Length)
                {
                    throw new WitsmlResultParsingException($"Unable to parse log data due to unexpected amount of commas in row {result.Count + 1}. Expected {mnemonics.Length} got {keyValuePairs.Count}.", (int)HttpStatusCode.InternalServerError);
                }

                var data = keyValuePairs.Where(keyValuePair => !string.IsNullOrEmpty(keyValuePair.value)).ToDictionary(keyValuePair => mnemonics[keyValuePair.index], keyValuePair => new LogDataValue(keyValuePair.value));
                result.Add(data);
            }

            return result;
        }
    }
}
