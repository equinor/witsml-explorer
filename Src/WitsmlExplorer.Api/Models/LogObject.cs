using Witsml.Data;

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
