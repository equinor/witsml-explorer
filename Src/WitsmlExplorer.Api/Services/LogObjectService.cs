using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

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
                    ObjectGrowing = StringHelpers.ToBooleanSafe(log.ObjectGrowing),
                    ServiceCompany = log.ServiceCompany,
                    RunNumber = log.RunNumber,
                    StartIndex = log.GetStartIndexAsString(),
                    EndIndex = log.GetEndIndexAsString(),
                    IndexCurve = log.IndexCurve.Value,
                    CommonData = new CommonData()
                    {
                        DTimCreation = log.CommonData.DTimCreation,
                        DTimLastChange = log.CommonData.DTimLastChange,
                    }
                }).OrderBy(log => log.Name);
        }

        public async Task<LogObject> GetLog(string wellUid, string wellboreUid, string logUid)
        {
            return await GetLog(wellUid, wellboreUid, logUid, new OptionsIn(ReturnElements.All));
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
                ObjectGrowing = StringHelpers.ToBooleanSafe(witsmlLog.ObjectGrowing),
                ServiceCompany = witsmlLog.ServiceCompany,
                RunNumber = witsmlLog.RunNumber,
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
            return result.Logs.FirstOrDefault();
        }

        public async Task<IEnumerable<LogCurveInfo>> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid)
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
                    AxisDefinitions = logCurveInfo.AxisDefinitions?.Select(a => new AxisDefinition()
                    {
                        Uid = a.Uid,
                        Order = a.Order,
                        Count = a.Count,
                        DoubleValues = a.DoubleValues
                    }).ToList(),
                });
        }

        public async Task<LogData> ReadLogData(string wellUid, string wellboreUid, string logUid, List<string> mnemonics, bool startIndexIsInclusive, string start, string end)
        {
            WitsmlLog log = await GetLogHeader(wellUid, wellboreUid, logUid);

            Index startIndex = Index.Start(log, start);
            Index endIndex = Index.End(log, end);

            string indexMnemonic = log.IndexCurve.Value;
            if (!mnemonics.Contains(indexMnemonic))
            {
                mnemonics.Insert(0, indexMnemonic);
            }

            WitsmlLogs query = LogQueries.GetLogContent(wellUid, wellboreUid, logUid, log.IndexType, mnemonics, startIndex, endIndex);
            WitsmlLogs witsmlLogs = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            if (!witsmlLogs.Logs.Any() || witsmlLogs.Logs.First().LogData == null || !witsmlLogs.Logs.First().LogData.Data.Any())
            {
                return new LogData();
            }

            WitsmlLog witsmlLog = witsmlLogs.Logs.First();

            if (!startIndexIsInclusive)
            {
                witsmlLog.LogData.Data.RemoveAt(0);
                if (witsmlLog.LogData.Data.Count == 0)
                {
                    return new LogData();
                }
            }

            string[] witsmlLogMnemonics = witsmlLog.LogData.MnemonicList.Split(",");
            string[] witsmlLogUnits = witsmlLog.LogData.UnitList.Split(",");

            return new LogData
            {
                StartIndex = Index.Start(witsmlLog).GetValueAsString(),
                EndIndex = Index.End(witsmlLog).GetValueAsString(),
                CurveSpecifications = witsmlLogMnemonics.Zip(witsmlLogUnits, (mnemonic, unit) =>
                    new CurveSpecification { Mnemonic = mnemonic, Unit = unit }),
                Data = GetDataDictionary(witsmlLog.LogData)
            };
        }

        private static IEnumerable<Dictionary<string, LogDataValue>> GetDataDictionary(WitsmlLogData logData)
        {
            List<Dictionary<string, LogDataValue>> result = new();
            string[] mnemonics = logData.MnemonicList.Split(",");
            foreach (string valueRow in logData.Data.Select(d => d.Data))
            {
                Dictionary<string, LogDataValue> data = new();
                var keyValuePairs = valueRow.Split(",").Select((value, index) => new { index, value });
                if (keyValuePairs.Count() > mnemonics.Length)
                {
                    throw new WitsmlResultParsingException($"Unable to parse log data due to unexpected amount of commas in row {result.Count + 1}. Expected {mnemonics.Length} got {keyValuePairs.Count()}.", (int)HttpStatusCode.InternalServerError);
                }
                foreach (var keyValuePair in keyValuePairs)
                {
                    if (string.IsNullOrEmpty(keyValuePair.value))
                    {
                        continue;
                    }

                    data.Add(mnemonics[keyValuePair.index], new LogDataValue(keyValuePair.value));
                }
                result.Add(data);
            }

            return result;
        }
    }
}
