using System;
using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DateTimeIndex : Index
    {
        private readonly DateTime _dateTime;
        public const string IsoPattern = "yyyy-MM-ddTHH:mm:ss.fffZ";
        public const string NullValue = "1900-01-01T00:00:00.000Z";

        public DateTimeIndex(DateTime dateTime)
        {
            this._dateTime = dateTime;
        }

        public DateTime Value => _dateTime;

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

        public override Index AddEpsilon() => new DateTimeIndex(_dateTime.AddMilliseconds(1));

        public override int CompareTo(Index that)
        {
            var thatWitsmlDateTime = (DateTimeIndex)that;
            return _dateTime.CompareTo(thatWitsmlDateTime._dateTime);
        }

        public override string GetValueAsString() => _dateTime.ToUniversalTime().ToString(IsoPattern);

        public override bool IsContinuous(Index that)
        {
            var thatWitsmlDateTime = (DateTimeIndex)that;
            var timespan = _dateTime - thatWitsmlDateTime._dateTime;
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
