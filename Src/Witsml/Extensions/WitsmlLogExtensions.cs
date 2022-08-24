using Witsml.Data;

namespace Witsml.Extensions
{
    public static class WitsmlLogExtensions
    {
        public static string GetStartIndexAsString(this WitsmlLog witsmlLog)
        {
            return witsmlLog.StartIndex == null && string.IsNullOrEmpty(witsmlLog.StartDateTimeIndex)
                ? null
                : witsmlLog.IndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD, System.StringComparison.Ordinal) ? witsmlLog.StartIndex != null ? witsmlLog.StartIndex.ToString() : "" : witsmlLog.StartDateTimeIndex;
        }

        public static string GetEndIndexAsString(this WitsmlLog witsmlLog)
        {
            return witsmlLog.EndIndex == null && string.IsNullOrEmpty(witsmlLog.EndDateTimeIndex)
                ? null
                : witsmlLog.IndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD, System.StringComparison.Ordinal) ? witsmlLog.EndIndex != null ? witsmlLog.EndIndex.ToString() : "" : witsmlLog.EndDateTimeIndex;
        }
    }
}
