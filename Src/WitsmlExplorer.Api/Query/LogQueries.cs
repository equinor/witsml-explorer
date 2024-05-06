using System.Collections.Generic;
using System.Linq;

using Witsml;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class LogQueries
    {
        public static WitsmlLogs GetWitsmlLogsByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    IndexType = "",
                    RunNumber = "",
                    ObjectGrowing = "",
                    ServiceCompany = "",
                    StartIndex = new WitsmlIndex(),
                    EndIndex = new WitsmlIndex(),
                    StartDateTimeIndex = "",
                    EndDateTimeIndex = "",
                    IndexCurve = new WitsmlIndexCurve(),
                    Direction = "",
                    CommonData = new WitsmlCommonData()
                    {
                        DTimCreation = "",
                        DTimLastChange = ""
                    },
                    LogCurveInfo = new List<WitsmlLogCurveInfo>()
                    {
                        new WitsmlLogCurveInfo()
                        {
                            Mnemonic = ""
                        }
                    }
                }.AsItemInList()
            };
        }

        public static WitsmlLogs GetWitsmlLogById(string wellUid, string wellboreUid, string logUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsItemInList()
            };
        }

        public static WitsmlLogs GetWitsmlLogsByIds(string wellUid, string wellboreUid, string[] logUids)
        {
            return new WitsmlLogs
            {
                Logs = logUids.Select(logUid =>
                    new WitsmlLog
                    {
                        Uid = logUid,
                        UidWell = wellUid,
                        UidWellbore = wellboreUid
                    }
                ).ToList()
            };
        }

        public static WitsmlLogs GetLogContent(
            string wellUid,
            string wellboreUid,
            string logUid,
            string indexType,
            IEnumerable<string> mnemonics,
            Index startIndex,
            Index endIndex)
        {
            WitsmlLog queryLog = new()
            {
                Uid = logUid,
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                LogCurveInfo = new List<WitsmlLogCurveInfo>(),
                LogData = new WitsmlLogData
                {
                    MnemonicList = string.Join(CommonConstants.DataSeparator, mnemonics)
                }
            };

            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    queryLog.StartIndex = startIndex != null ? new WitsmlIndex((DepthIndex)startIndex) : new WitsmlIndex();
                    queryLog.EndIndex = endIndex != null ? new WitsmlIndex((DepthIndex)endIndex) : new WitsmlIndex();
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    queryLog.StartDateTimeIndex = startIndex?.GetValueAsString() ?? "";
                    queryLog.EndDateTimeIndex = endIndex?.GetValueAsString() ?? "";
                    break;
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { queryLog }
            };
        }

        public static WitsmlLogs DeleteLogCurveContent(
            string wellUid,
            string wellboreUid,
            string logUid,
            string indexType,
            List<WitsmlLogCurveInfo> logCurveInfos,
            Index startIndex,
            Index endIndex)
        {
            WitsmlLog queryLog = new()
            {
                Uid = logUid,
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                LogCurveInfo = logCurveInfos.Select(lci => new WitsmlLogCurveInfo
                {
                    Uid = lci.Uid,
                    Mnemonic = lci.Mnemonic
                }).ToList()
            };

            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    queryLog.StartIndex = new WitsmlIndex((DepthIndex)startIndex);
                    queryLog.EndIndex = new WitsmlIndex((DepthIndex)endIndex);
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    queryLog.StartDateTimeIndex = startIndex.GetValueAsString();
                    queryLog.EndDateTimeIndex = endIndex.GetValueAsString();
                    break;
                default:
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> { queryLog }
            };
        }

        public static WitsmlLogs DeleteMnemonics(string wellUid, string wellboreUid, string logUid, IEnumerable<string> mnemonics)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = logUid,
                    LogCurveInfo = mnemonics.Select(mnemonic => new WitsmlLogCurveInfo
                    {
                        Mnemonic = mnemonic
                    }).ToList()
                }.AsItemInList()
            };
        }

        public static WitsmlLogs GetLogHeaderIndexes(string wellUid, string wellboreUid, string logUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = logUid,
                    StartIndex = new WitsmlIndex(),
                    EndIndex = new WitsmlIndex(),
                    StartDateTimeIndex = "",
                    EndDateTimeIndex = "",
                    IndexCurve = new WitsmlIndexCurve(),
                    LogCurveInfo = new WitsmlLogCurveInfo
                    {
                        Mnemonic = "",
                        MinIndex = new WitsmlIndex(),
                        MaxIndex = new WitsmlIndex(),
                        MinDateTimeIndex = "",
                        MaxDateTimeIndex = ""
                    }.AsItemInList(),
                }.AsItemInList()
            };
        }
    }
}
