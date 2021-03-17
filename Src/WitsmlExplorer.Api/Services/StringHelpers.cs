using System;

namespace WitsmlExplorer.Api.Services
{
    public static class StringHelpers
    {
        /// <summary>
        /// Converts "1", "0" and string representation of logical value to boolean
        /// All other strings converted to false
        /// </summary>
        /// <param name="input">string value to convert</param>
        /// <returns> boolean value for given input string</returns>
        /// 
        public static bool ToBooleanSafe(string input)
        {
            if (string.IsNullOrEmpty(input) || input == "0")
                return false;
            if (input == "1")
                return true;

            bool.TryParse(input, out var value);

            return value;
        }

        public static bool ToBoolean(string input)
        {
            if (string.IsNullOrEmpty(input))
                throw new ArgumentException($"Value is null er empty: {input}");
            var isBoolean = bool.TryParse(input, out var value);
            if (isBoolean)
                return value;

            throw new ArgumentException($"Input is not compatible to be parsed to a boolean value: {input}");
        }

        public static DateTime? ToDateTime(string input)
        {
            if (string.IsNullOrEmpty(input))
                return null;
            var isDateTime = DateTime.TryParse(input, out var value);
            if (isDateTime)
                return value;

            throw new ArgumentException($"Input is not compatible to be parsed to a DateTime value: {input}");
        }

        public static decimal ToDecimal(string input)
        {
            if (string.IsNullOrEmpty(input))
                throw new ArgumentException($"Value is null er empty: {input}");
            var isDecimal = decimal.TryParse(input, out var value);
            if (isDecimal)
                return value;

            throw new ArgumentException($"Input is not compatible to be parsed to a decimal value: {input}");
        }
    }
}
