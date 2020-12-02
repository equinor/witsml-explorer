using System;
using Witsml.Data.Curves;

namespace Witsml.Extensions
{
    public static class DateTimeExtensions
    {
        public static string ToISODateTimeString(this DateTime dateTime)
        {
            return dateTime.ToUniversalTime().ToString(DateTimeIndex.IsoPattern);
        }
    }
}
