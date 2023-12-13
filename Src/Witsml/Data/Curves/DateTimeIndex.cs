using System;
using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DateTimeIndex : Index
    {
        public DateTime Value { get; }

        public DateTimeIndex(DateTime dateTime)
        {
            Value = dateTime;
        }

        public static DateTimeIndex FromString(string dateString)
        {
            return DateTime.TryParseExact(dateString, CommonConstants.DateTimeIndex.IsoPattern, null, DateTimeStyles.None, out DateTime parsedDateTime)
                ? new DateTimeIndex(parsedDateTime)
                : throw new Exception($"Date format not recognized: {dateString}");
        }

        public static bool TryParseISODate(string dateString, out DateTimeIndex dateTimeIndex)
        {
            if (DateTime.TryParseExact(dateString, CommonConstants.DateTimeIndex.IsoPattern, null, DateTimeStyles.None, out DateTime tmpDateTime))
            {
                dateTimeIndex = new DateTimeIndex(tmpDateTime);
                return true;
            }

            dateTimeIndex = null;
            return false;
        }

        [Obsolete("AddEpsilon is deprecated due to assuming 3 decimals of precision for depth indexes. Some WITSML servers do not use 3 decimals.")]
        public override Index AddEpsilon()
        {
            return new DateTimeIndex(Value.AddMilliseconds(1));
        }

        public override int CompareTo(Index that)
        {
            DateTimeIndex thatWitsmlDateTime = (DateTimeIndex)that;
            return Value.CompareTo(thatWitsmlDateTime.Value);
        }

        public override string GetValueAsString()
        {
            return Value.ToUniversalTime().ToString(CommonConstants.DateTimeIndex.IsoPattern, CultureInfo.InvariantCulture);
        }

        public override bool IsContinuous(Index that)
        {
            DateTimeIndex thatWitsmlDateTime = (DateTimeIndex)that;
            TimeSpan timespan = Value - thatWitsmlDateTime.Value;
            return Math.Abs(timespan.Seconds) < 10;
        }

        public override bool IsNegative()
        {
            return false;
        }

        public override bool IsNullValue()
        {
            return Value.Date.Equals(DateTime.Parse(CommonConstants.DateTimeIndex.NullValue));
        }

        public override string ToString()
        {
            return GetValueAsString();
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(this, obj))
            {
                return true;
            }

            if (obj is DateTimeIndex dateTimeIndex)
            {
                return this.Value == dateTimeIndex.Value;
            }

            return obj is null ? false : throw new NotImplementedException();
        }

        public override int GetHashCode()
        {
            return this.Value.GetHashCode();
        }

        public static TimeSpan operator -(DateTimeIndex index1, DateTimeIndex index2)
        {
            return index1.Value - index2.Value;
        }
    }
}
