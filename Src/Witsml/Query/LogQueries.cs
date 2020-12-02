using System.Collections.Generic;
using System.Linq;
using Witsml.Data;
using Witsml.Data.Curves;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class LogQueries
    {
        public static WitsmlLogs QueryByWellbore(string wellUid, string wellboreUid)
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
                    StartIndex = new WitsmlIndex(),
                    EndIndex = new WitsmlIndex(),
                    StartDateTimeIndex = "",
                    EndDateTimeIndex = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlLogs QueryById(string wellUid, string wellboreUid, string logUid)
        {
            return new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = logUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlLogs QueryLogContent(
            string wellUid,
            string wellboreUid,
            string logUid,
            string indexType,
            IEnumerable<string> mnemonics,
            Index startIndex,
            Index endIndex)
        {
            var queryLog = new WitsmlLog
            {
                Uid = logUid,
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                IndexType = "",
                LogCurveInfo = new List<WitsmlLogCurveInfo>(),
                LogData = new WitsmlLogData
                {
                    MnemonicList = string.Join(",", mnemonics)
                }
            };

            switch (indexType)
            {
                case WitsmlLog.WITSML_INDEX_TYPE_MD:
                    queryLog.StartIndex = new WitsmlIndex((DepthIndex) startIndex);
                    queryLog.EndIndex = new WitsmlIndex((DepthIndex) endIndex);
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    queryLog.StartDateTimeIndex = startIndex.GetValueAsString();
                    queryLog.EndDateTimeIndex = endIndex.GetValueAsString();
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> {queryLog}
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
            var queryLog = new WitsmlLog
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
                    queryLog.StartIndex = new WitsmlIndex((DepthIndex) startIndex);
                    queryLog.EndIndex = new WitsmlIndex((DepthIndex) endIndex);
                    break;
                case WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME:
                    queryLog.StartDateTimeIndex = startIndex.GetValueAsString();
                    queryLog.EndDateTimeIndex = endIndex.GetValueAsString();
                    break;
            }

            return new WitsmlLogs
            {
                Logs = new List<WitsmlLog> {queryLog}
            };
        }

        public static WitsmlLogs DeleteMnemonicsQuery(string wellUid, string wellboreUid, string logUid, string[] mnemonics)
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
                }.AsSingletonList()
            };
        }
    }
}
