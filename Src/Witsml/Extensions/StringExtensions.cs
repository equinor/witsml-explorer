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
        
        /// <summary>
        /// Determines whether two specified string objects have the same value.
        /// </summary>
        /// The first string to compare.
        /// The second string to compare.
        /// <returns>True if the value of the <paramref name="firstValue" /> parameter is equal to the value of the <paramref name="secondValue" />, otherwise return false.</returns>
        public static bool EqualsIgnoreCase(this string firstValue, string secondValue)
        {
            if (firstValue == null && secondValue == null)
            {
                return true;
            }
            
            if (firstValue == null || secondValue == null)
            {
                return false;
            }
            return firstValue.Equals(secondValue, StringComparison.OrdinalIgnoreCase);
        }
    }
}
