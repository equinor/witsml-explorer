using System;
using System.Globalization;

namespace Witsml.Extensions
{
    public static class StringExtensions
    {
        public static bool IsNumeric(this string input)
        {
            return double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out _);
        }

        public static string NullIfEmpty(this string value)
        {
            return string.IsNullOrEmpty(value) ? null : value;
        }
    }
}
