using Witsml.Data;

namespace Witsml.Extensions
{
    public static class WitsmlLogExtensions
    {
        public static string GetStartIndexAsString(this WitsmlLog witsmlLog)
        {
            if (witsmlLog.StartIndex == null && string.IsNullOrEmpty(witsmlLog.StartDateTimeIndex)) return null;
            return witsmlLog.IndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD) ? witsmlLog.StartIndex != null ? witsmlLog.StartIndex.ToString() : "" : witsmlLog.StartDateTimeIndex;
        }

        public static string GetEndIndexAsString(this WitsmlLog witsmlLog)
        {
            if (witsmlLog.EndIndex == null && string.IsNullOrEmpty(witsmlLog.EndDateTimeIndex)) return null;
            return witsmlLog.IndexType.Equals(WitsmlLog.WITSML_INDEX_TYPE_MD) ? witsmlLog.EndIndex != null ? witsmlLog.EndIndex.ToString() : "" : witsmlLog.EndDateTimeIndex;
        }
    }
}
