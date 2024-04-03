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
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid);
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions);
        Task<ICollection<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid);
        Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end, bool loadAllData, CancellationToken? cancellationToken, IProgress<double> progressReporter = null);
    }

    // ReSharper disable once UnusedMember.Global
    public class LogObjectService : WitsmlService, ILogObjectService
    {
        public LogObjectService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }
        public async Task<ICollection<LogObject>> GetLogs(string wellUid, string wellboreUid)
        {
            WitsmlLogs witsmlLog = LogQueries.GetWitsmlLogsByWellbore(wellUid, wellboreUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(witsmlLog, new OptionsIn(ReturnElements.HeaderOnly));

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

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid)
        {
            return await GetLog(wellUid, wellboreUid, logUid, new OptionsIn(ReturnElements.HeaderOnly));
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions)
        {
            WitsmlLogs query = LogQueries.GetWitsmlLogById(wellUid, wellboreUid, logUid);
            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, queryOptions);
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
                    double progress = LogWorkerTools.CalculateProgressBasedOnIndex(log, logData);
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
