using System;
using System.Globalization;

namespace WitsmlExplorer.Api.Services
{
    public static class StringHelpers
    {
        /// <summary>
        /// Converts "1", "0", NULL and string representation of logical value (true/false) to boolean
        /// All other strings throws exception
        /// </summary>
        /// <param name="input">string value to convert</param>
        /// <returns> boolean value for given input string</returns>
        ///
        public static bool ToBoolean(string input)
        {
            if (string.IsNullOrEmpty(input) || input == "0")
            {
                return false;
            }

            if (input == "1")
            {
                return true;
            }

            if (!bool.TryParse(input, out bool value))
            {
                throw new ArgumentException($"Input is not compatible to be parsed to a bool value: {input}");
            }

            return value;
        }

        /// <summary>
        /// Converts a nullable boolean to either "true" or "false", or null if input is null.
        /// WITSML does not allow the default bool.ToString() values of "True" and "False".
        /// </summary>
        /// <param name="input">bool? value to convert</param>
        /// <returns> string value for given input boolean, or null if input is null</returns>
        ///
        public static string NullableBooleanToString(bool? input)
        {
            return input?.ToString().ToLowerInvariant();
        }

        public static DateTime? ToDateTime(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }

            bool isDateTime = DateTime.TryParse(input, out DateTime value);

            return isDateTime ? value : throw new ArgumentException($"Input is not compatible to be parsed to a DateTime value: {input}");
        }

        public static string ToUniversalDateTimeString(string input)
        {
            DateTime? dateTime = ToDateTime(input);
            return dateTime?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        }

        public static decimal ToDecimal(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException($"Value is null er empty: {input}");
            }

            bool isDecimal = decimal.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal value);

            return isDecimal ? value : throw new ArgumentException($"Input is not compatible to be parsed to a decimal value: {input}");
        }
        public static double ToDouble(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                throw new ArgumentException($"Value is null er empty: {input}");
            }

            bool isDouble = double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out double value);

            return isDouble ? value : throw new ArgumentException($"Input is not compatible to be parsed to a double value: {input}");
        }
    }
}
