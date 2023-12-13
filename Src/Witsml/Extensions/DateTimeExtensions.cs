using System;
using System.Globalization;

using Witsml.Data.Curves;

namespace Witsml.Extensions
{
    public static class DateTimeExtensions
    {
        public static string ToISODateTimeString(this DateTime dateTime)
        {
            return dateTime.ToUniversalTime().ToString(CommonConstants.DateTimeIndex.IsoPattern, CultureInfo.InvariantCulture);
        }
    }
}
