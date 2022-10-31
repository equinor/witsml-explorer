using System;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

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
            {
                return false;
            }

            if (input == "1")
            {
                return true;
            }

            bool isBoolean = bool.TryParse(input, out bool value);

            return isBoolean ? value : throw new ArgumentException($"Input is not compatible to be parsed to a bool value: {input}");
        }

        public static bool ToBoolean(string input)
        {
            return ToBooleanSafe(input);
        }

        /// <summary>
        /// Converts a nullable boolean to either "true" or "false", or null if input is null.
        /// WITSML does not allow the default bool.ToString() values of "True" and "False".
        /// </summary>
        /// <param name="input">bool? value to convert</param>
        /// <returns> string value for given input boolean, or null if input is null</returns>
        ///
        public static string OptionalBooleanToString(bool? input)
        {
            if (input == null)
            {
                return null;
            }
            return (bool)input ? "true" : "false";
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

        public static string CreateMD55(string input)
        {
            // deepcode ignore InsecureHash: md5 used only as a lookupvalue
            using MD5 md5 = MD5.Create();
            byte[] inputBytes = Encoding.ASCII.GetBytes(input);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            StringBuilder sb = new();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("X2"));
            }
            return sb.ToString();
        }

    }
}
