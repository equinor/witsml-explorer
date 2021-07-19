using Spectre.Console.Cli;

namespace WitsmlExplorer.Console.ShowCommands
{
    public class ShowTubularSettings : CommandSettings
    {
        [CommandArgument(0, "<WELL_UID>")]
        public string WellUid { get; init; }

        [CommandArgument(1, "<WELLBORE_UID>")]
        public string WellboreUid { get; init; }

        [CommandArgument(2, "<TUBULAR_UID>")]
        public string TubularUid { get; init; }
    }
}
