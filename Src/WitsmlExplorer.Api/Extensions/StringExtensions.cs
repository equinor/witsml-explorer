namespace WitsmlExplorer.Api.Extensions
{
    public static class StringExtensions
    {
        public static string CapitalizeFirstLetter(this string str)
        {
            return char.ToUpper(str[0]) + str[1..];
        }
    }
}
