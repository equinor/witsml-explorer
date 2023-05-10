using System.ComponentModel;

using Spectre.Console.Cli;

namespace WitsmlExplorer.Console.ShowCommands
{
    public class ShowLogHeaderSettings : CommandSettings
    {
        [CommandArgument(0, "<WELL_UID>")]
        public string WellUid { get; init; }

        [CommandArgument(1, "<WELLBORE_UID>")]
        public string WellboreUid { get; init; }

        [CommandArgument(2, "<LOG_UID>")]
        public string LogUid { get; init; }

        [CommandOption("--mnemonic")]
        [Description("Filter on a given mnemonic")]
        public string FilterOnMnemonic { get; init; }

        [CommandOption("--orderByEndIndex")]
        [Description("Order by descending end index instead of name")]
        public bool OrderByEndIndex { get; init; }

        [CommandOption("--max")]
        [Description("Maximum number of mnemonics to list")]
        [DefaultValue(999)]
        public int MaxMnemonics { get; init; }
    }
}
