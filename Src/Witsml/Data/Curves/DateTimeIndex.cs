using System;
using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DateTimeIndex : Index
    {

        public DateTime Value { get; }
        public const string IsoPattern = "yyyy-MM-ddTHH:mm:ss.fffZ";
        public const string NullValue = "1900-01-01T00:00:00.000Z";

        public DateTimeIndex(DateTime dateTime)
        {
            Value = dateTime;
        }

        public static DateTimeIndex FromString(string dateString)
        {
            return (DateTime.TryParseExact(dateString, IsoPattern, null, DateTimeStyles.None, out var parsedDateTime))
                ? new DateTimeIndex(parsedDateTime)
                : throw new Exception($"Date format not recognized: {dateString}");
        }

        public static bool TryParseISODate(string dateString, out DateTimeIndex dateTimeIndex)
        {
            if (DateTime.TryParseExact(dateString, DateTimeIndex.IsoPattern, null, DateTimeStyles.None, out var tmpDateTime))
            {
                dateTimeIndex = new DateTimeIndex(tmpDateTime);
                return true;
            }

            dateTimeIndex = null;
            return false;
        }

        public override Index AddEpsilon() => new DateTimeIndex(Value.AddMilliseconds(1));

        public override int CompareTo(Index that)
        {
            var thatWitsmlDateTime = (DateTimeIndex)that;
            return Value.CompareTo(thatWitsmlDateTime.Value);
        }

        public override string GetValueAsString() => Value.ToUniversalTime().ToString(IsoPattern);

        public override bool IsContinuous(Index that)
        {
            var thatWitsmlDateTime = (DateTimeIndex)that;
            var timespan = Value - thatWitsmlDateTime.Value;
            return Math.Abs(timespan.Seconds) < 10;
        }

        public override bool IsNegative() => false;
        public override bool IsNullValue()
        {
            return Value.Date.Equals(DateTime.Parse(NullValue));
        }

        public override string ToString() => GetValueAsString();
    }
}
