using System;
using System.Globalization;
using Witsml.Extensions;

namespace Witsml.Data.Curves
{
    public abstract class Index : IComparable<Index>
    {
        public static bool operator <(Index index1, Index index2)
        {
            return index1.CompareTo(index2) < 0;
        }

        public static bool operator <=(Index index1, Index index2)
        {
            return index1.CompareTo(index2) <= 0;
        }

        public static bool operator >(Index index1, Index index2)
        {
            return index1.CompareTo(index2) > 0;
        }

        public static bool operator >=(Index index1, Index index2)
        {
            return index1.CompareTo(index2) >= 0;
        }

        public abstract Index AddEpsilon();

        public abstract int CompareTo(Index other);

        public abstract string GetValueAsString();

        public abstract bool IsContinuous(Index that);

        public abstract bool IsNegative();

        public abstract bool IsNullValue();

        public static Index Start(WitsmlLog log, string customIndexValue = "")
        {
            return log.IndexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => (Index) new DepthIndex(double.Parse(customIndexValue.IsNumeric() ? customIndexValue : log.StartIndex.Value, CultureInfo.InvariantCulture),
                    log.StartIndex.Uom),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(customIndexValue.NullIfEmpty() ?? log.StartDateTimeIndex)),
                _ => throw new Exception($"Invalid index type: '{log.IndexType}'")
            };
        }

        public static Index End(WitsmlLog log, string customIndexValue = "")
        {
            return log.IndexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => (Index) new DepthIndex(double.Parse(customIndexValue.IsNumeric() ? customIndexValue : log.EndIndex.Value, CultureInfo.InvariantCulture),
                    log.EndIndex.Uom),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(customIndexValue.NullIfEmpty() ?? log.EndDateTimeIndex)),
                _ => throw new Exception($"Invalid index type: '{log.IndexType}'")
            };
        }

        public static Index Min(string indexType, WitsmlLogCurveInfo logCurveInfo)
        {
            if (logCurveInfo == null)
                return null;

            return indexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => (Index) new DepthIndex(double.Parse(logCurveInfo.MinIndex.Value, CultureInfo.InvariantCulture), logCurveInfo.MinIndex.Uom),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(logCurveInfo.MinDateTimeIndex)),
                _ => throw new Exception($"Invalid index type: '{indexType}'")
            };
        }

        public static Index Max(string indexType, WitsmlLogCurveInfo logCurveInfo)
        {
            if (logCurveInfo == null)
                return null;

            return indexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => (Index) new DepthIndex(double.Parse(logCurveInfo.MaxIndex.Value, CultureInfo.InvariantCulture), logCurveInfo.MaxIndex.Uom),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(logCurveInfo.MaxDateTimeIndex)),
                _ => throw new Exception($"Invalid index type: '{indexType}'")
            };
        }
    }
}
