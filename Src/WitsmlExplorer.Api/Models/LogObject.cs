using System.Linq;

using Witsml.Data;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class LogObject : ObjectOnWellbore
    {
        public string IndexType { get; set; }
        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
        public bool? ObjectGrowing { get; init; }
        public string ServiceCompany { get; init; }
        public string RunNumber { get; init; }
        public string IndexCurve { get; init; }
        public int Mnemonics { get; init; }
        public CommonData CommonData { get; init; }
        public string Direction { get; init; }

        public static string ConvertDirection(WitsmlLog witsmlLog)
        {
            return witsmlLog?.Direction?.ToLowerInvariant() ?? WitsmlLog.WITSML_DIRECTION_INCREASING;
        }

        public static LogObject FromWitsml(WitsmlLog witsmlLog)
        {
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
                IndexCurve = witsmlLog.IndexCurve?.Value,
                ObjectGrowing = StringHelpers.ToBoolean(witsmlLog.ObjectGrowing),
                ServiceCompany = witsmlLog.ServiceCompany,
                RunNumber = witsmlLog.RunNumber,
                Direction = ConvertDirection(witsmlLog),
                Mnemonics = witsmlLog.LogCurveInfo?.Count ?? 0,
                CommonData = witsmlLog.CommonData == null ? null : new CommonData
                {
                    DTimCreation = witsmlLog.CommonData.DTimCreation,
                    DTimLastChange = witsmlLog.CommonData.DTimLastChange,
                }
            };

            if (!string.IsNullOrEmpty(witsmlLog.IndexType))
            {
                logObject.StartIndex = witsmlLog.GetStartIndexAsString();
                logObject.EndIndex = witsmlLog.GetEndIndexAsString();
            }

            return logObject;
        }

        public static LogCurveInfo LogCurveInfoFromWitsml(WitsmlLogCurveInfo logCurveInfo)
        {
            return logCurveInfo == null ? null : new LogCurveInfo
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
                AxisDefinitions = logCurveInfo.AxisDefinitions?.Select(a => new AxisDefinition
                {
                    Uid = a.Uid,
                    Order = a.Order,
                    Count = a.Count,
                    DoubleValues = a.DoubleValues
                }).ToList(),
            };
        }

        public override WitsmlLogs ToWitsml()
        {
            WitsmlLog log = new()
            {
                Uid = Uid,
                Name = Name,
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                IndexType = IndexType,
                ObjectGrowing = StringHelpers.NullableBooleanToString(ObjectGrowing),
                ServiceCompany = ServiceCompany,
                RunNumber = RunNumber,
                IndexCurve = IndexCurve != null ? new WitsmlIndexCurve { Value = IndexCurve } : null,
                CommonData = CommonData?.ToWitsml(),
                Direction = Direction
            };

            if (IndexType == WitsmlLog.WITSML_INDEX_TYPE_MD)
            {
                log.StartIndex = StartIndex != null ? new WitsmlIndex(StartIndex) : null;
                log.EndIndex = EndIndex != null ? new WitsmlIndex(EndIndex) : null;
            }
            else if (IndexType == WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME)
            {
                log.StartDateTimeIndex = StartIndex;
                log.EndDateTimeIndex = EndIndex;
            }

            return log.AsItemInWitsmlList();
        }
    }
}
