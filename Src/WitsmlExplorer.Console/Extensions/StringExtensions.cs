using Spectre.Console;

namespace WitsmlExplorer.Console.Extensions
{
    public static class StringExtensions
    {
        public static string WithColor(this string text, Color color) => $"[{color}]{text}[/]";
        public static string Bold(this string text) => $"[bold]{text}[/]";
    }
}
