using Spectre.Console.Cli;

namespace WitsmlExplorer.Console.ListCommands
{
    public class ListLogsSettings : CommandSettings
    {
        [CommandArgument(0, "<WELL_UID>")]
        public string WellUid { get; init; }

        [CommandArgument(1, "<WELLBORE_UID>")]
        public string WellboreUid { get; init; }
    }
}
