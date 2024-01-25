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

        public static Index operator -(Index index1, Index index2)
        {
            return index1 switch
            {
                DepthIndex depthIndex1 when index2 is DepthIndex depthIndex2 => depthIndex1 - depthIndex2,
                DateTimeIndex dateTimeIndex1 when index2 is DateTimeIndex dateTimeIndex2 => new TimeSpanIndex(dateTimeIndex1 - dateTimeIndex2),
                _ => throw new ArgumentException("Unsupported index types for subtraction")
            };
        }

        [Obsolete("AddEpsilon is deprecated due to assuming 3 decimals of precision for depth indexes. Some WITSML servers do not use 3 decimals.")]
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
                WitsmlLog.WITSML_INDEX_TYPE_MD => log.StartIndex == null && !customIndexValue.IsNumeric()
                    ? null
                    : new DepthIndex(
                        double.Parse(customIndexValue.IsNumeric() ? customIndexValue : log.StartIndex.Value,
                            CultureInfo.InvariantCulture),
                        log.StartIndex?.Uom ?? CommonConstants.DepthIndex.DefaultUnit),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => log.StartDateTimeIndex == null && string.IsNullOrEmpty(customIndexValue)
                    ? null
                    : new DateTimeIndex(DateTime.Parse(customIndexValue.NullIfEmpty() ?? log.StartDateTimeIndex,
                        CultureInfo.InvariantCulture)),
                _ => throw new Exception($"Invalid index type: '{log.IndexType}'")
            };
        }

        public static Index End(WitsmlLog log, string customIndexValue = "")
        {
            return log.IndexType switch
            {
                WitsmlLog.WITSML_INDEX_TYPE_MD => log.EndIndex == null && !customIndexValue.IsNumeric()
                    ? null
                    : new DepthIndex(
                        double.Parse(customIndexValue.IsNumeric() ? customIndexValue : log.EndIndex.Value,
                            CultureInfo.InvariantCulture),
                        log.EndIndex?.Uom ?? CommonConstants.DepthIndex.DefaultUnit),
                WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => log.EndDateTimeIndex == null && string.IsNullOrEmpty(customIndexValue)
                    ? null
                    : new DateTimeIndex(DateTime.Parse(customIndexValue.NullIfEmpty() ?? log.EndDateTimeIndex,
                        CultureInfo.InvariantCulture)),
                _ => throw new Exception($"Invalid index type: '{log.IndexType}'")
            };
        }

        public static Index Min(string indexType, WitsmlLogCurveInfo logCurveInfo)
        {
            return logCurveInfo == null
                ? null
                : indexType switch
                {
                    WitsmlLog.WITSML_INDEX_TYPE_MD => new DepthIndex(double.Parse(logCurveInfo.MinIndex.Value, CultureInfo.InvariantCulture), logCurveInfo.MinIndex.Uom),
                    WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(logCurveInfo.MinDateTimeIndex, CultureInfo.InvariantCulture)),
                    _ => throw new Exception($"Invalid index type: '{indexType}'")
                };
        }

        public static Index Max(string indexType, WitsmlLogCurveInfo logCurveInfo)
        {
            return logCurveInfo == null
                ? null
                : indexType switch
                {
                    WitsmlLog.WITSML_INDEX_TYPE_MD => new DepthIndex(double.Parse(logCurveInfo.MaxIndex.Value, CultureInfo.InvariantCulture), logCurveInfo.MaxIndex.Uom),
                    WitsmlLog.WITSML_INDEX_TYPE_DATE_TIME => new DateTimeIndex(DateTime.Parse(logCurveInfo.MaxDateTimeIndex, CultureInfo.InvariantCulture)),
                    _ => throw new Exception($"Invalid index type: '{indexType}'")
                };
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(this, obj))
            {
                return true;
            }

            return obj is null ? false : throw new NotImplementedException();
        }

        public override int GetHashCode()
        {
            throw new NotImplementedException();
        }

        public static bool operator ==(Index left, Index right)
        {
            return left is null ? right is null : left.Equals(right);
        }

        public static bool operator !=(Index left, Index right)
        {
            return !(left == right);
        }
    }
}
