using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Witsml.Data;
using Witsml.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using Index = Witsml.Data.Curves.Index;

namespace WitsmlExplorer.Api.Services
{
    public interface ILogObjectService
    {
        Task<IEnumerable<LogObject>> GetLogs(string wellUid, string wellboreUid);
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid);
        Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions);
        Task<IEnumerable<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid);
        Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end);
    }

    // ReSharper disable once UnusedMember.Global
    public class LogObjectService : WitsmlService, ILogObjectService
    {
        public LogObjectService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<LogObject>> GetLogs(string wellUid, string wellboreUid)
        {
            var query = LogQueries.QueryByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.HeaderOnly);

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
                    ServiceCompany = log.ServiceCompany,
                    RunNumber = log.RunNumber,
                    StartIndex = GetIndexAsString(log.IndexType, log.StartIndex, log.StartDateTimeIndex),
                    EndIndex = GetIndexAsString(log.IndexType, log.EndIndex, log.EndDateTimeIndex),
                    DateTimeLastChange = StringHelpers.ToDateTime(log.CommonData.DTimLastChange),
                    IndexCurve = log.IndexCurve.Value
                }).OrderBy(log => log.Name);
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid)
        {
            return await GetLog(wellUid, wellboreUid, logUid, OptionsIn.All);
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid, OptionsIn queryOptions)
        {
            var query = LogQueries.QueryById(wellUid, wellboreUid, logUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, queryOptions);
            var witsmlLog = result.Logs.FirstOrDefault();
            if (witsmlLog == null) return null;

            var logObject = new LogObject
            {
                Uid = witsmlLog.Uid,
                Name = witsmlLog.Name,
                IndexType = witsmlLog.IndexType,
                WellUid = witsmlLog.UidWell,
                WellName = witsmlLog.NameWell,
                WellboreUid = witsmlLog.UidWellbore,
                WellboreName = witsmlLog.NameWellbore,
                IndexCurve = witsmlLog.IndexCurve.Value,
                ServiceCompany = witsmlLog.ServiceCompany,
                RunNumber = witsmlLog.RunNumber
            };
            if (string.IsNullOrEmpty(witsmlLog.IndexType)) return logObject;

            logObject.StartIndex = GetIndexAsString(witsmlLog.IndexType, witsmlLog.StartIndex, witsmlLog.StartDateTimeIndex);
            logObject.EndIndex = GetIndexAsString(witsmlLog.IndexType, witsmlLog.EndIndex, witsmlLog.EndDateTimeIndex);

            return logObject;
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            var query = LogQueries.QueryById(wellUid, wellboreUid, logUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.HeaderOnly);
            return result.Logs.FirstOrDefault();
        }

        public async Task<IEnumerable<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid)
        {
            var witsmlLog = await GetLogHeader(wellUid, wellboreUid, logUid);

            return witsmlLog?.LogCurveInfo.Select(logCurveInfo =>
                new LogCurveInfo
                {
                    Uid = logCurveInfo.Uid,
                    Mnemonic = logCurveInfo.Mnemonic,
                    ClassWitsml = logCurveInfo.ClassWitsml,
                    MaxDateTimeIndex = StringHelpers.ToDateTime(logCurveInfo.MaxDateTimeIndex),
                    MaxDepthIndex = logCurveInfo.MaxIndex?.Value,
                    MinDateTimeIndex = StringHelpers.ToDateTime(logCurveInfo.MinDateTimeIndex),
                    MinDepthIndex = logCurveInfo.MinIndex?.Value,
                    MnemAlias = logCurveInfo.MnemAlias,
                    Unit = logCurveInfo.Unit
                });
        }

        public async Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end)
        {
            var log = await GetLogHeader(wellUid, wellboreUid, logUid);

            var startIndex = Index.Start(log, start);
            var endIndex = Index.End(log, end);

            if (!startIndexIsInclusive) startIndex = startIndex.AddEpsilon();

            if (startIndex > endIndex) return new LogData();

            var indexMnemonic = log.IndexCurve.Value;
            if (!mnemonics.Contains(indexMnemonic)) mnemonics.Insert(0, indexMnemonic);

            var query = LogQueries.QueryLogContent(wellUid, wellboreUid, logUid, log.IndexType, mnemonics, startIndex, endIndex);
            var witsmlLogs = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);
            if (!witsmlLogs.Logs.Any() || witsmlLogs.Logs.First().LogData == null) return new LogData();

            var witsmlLog = witsmlLogs.Logs.First();

            var witsmlLogMnemonics = witsmlLog.LogData.MnemonicList.Split(",");
            var witsmlLogUnits = witsmlLog.LogData.UnitList.Split(",");

            return new LogData
            {
                StartIndex = Index.Start(witsmlLog).GetValueAsString(),
                EndIndex = Index.End(witsmlLog).GetValueAsString(),
                CurveSpecifications = witsmlLogMnemonics.Zip(witsmlLogUnits, (mnemonic, unit) =>
                    new CurveSpecification {Mnemonic = mnemonic, Unit = unit}),
                Data = GetDataDictionary(witsmlLog.LogData)
            };
        }

        private static IEnumerable<Dictionary<string, LogDataValue>> GetDataDictionary(WitsmlLogData logData)
        {
            var result = new List<Dictionary<string, LogDataValue>>();
            var mnemonics = logData.MnemonicList.Split(",");
            foreach (var valueRow in logData.Data.Select(d => d.Data))
            {
                var data = new Dictionary<string, LogDataValue>();
                foreach (var keyValuePair in valueRow.Split(",")
                    .Select((value, index) => new {index, value}))
                {
                    if (string.IsNullOrEmpty(keyValuePair.value)) continue;
                    data.Add(mnemonics[keyValuePair.index], new LogDataValue(keyValuePair.value));
                }
                result.Add(data);
            }

            return result;
        }

        private static string GetIndexAsString(string indexType, WitsmlIndex index, string dateTimeIndex)
        {
            if (index == null && string.IsNullOrEmpty(dateTimeIndex)) return null;
            return indexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD) ? index != null ? index.ToString() : "" : dateTimeIndex;
        }
    }
}
