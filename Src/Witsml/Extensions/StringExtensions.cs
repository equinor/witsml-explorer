namespace Witsml.Extensions
{
    public static class StringExtensions
    {
        public static bool IsNumeric(this string input)
        {
            return double.TryParse(input, out _);
        }

        public static string NullIfEmpty(this string value)
        {
            return string.IsNullOrEmpty(value) ? null : value;
        }
    }
}
