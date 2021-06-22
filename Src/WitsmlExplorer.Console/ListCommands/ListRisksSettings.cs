using System;
using System.ComponentModel;
using Spectre.Console;
using Spectre.Console.Cli;

namespace WitsmlExplorer.Console.ListCommands
{
    public class ListRisksSettings : CommandSettings
    {
        [CommandOption("--uidWell")]
        [Description("Well UID")]
        [DefaultValue("")]
        public string WellUid { get; init; }

        [CommandOption("--uidWellbore")]
        [Description("Wellbore UID")]
        [DefaultValue("")]
        public string WellboreUid { get; init; }

        [CommandOption("--source")]
        [Description("Source for the risk")]
        [DefaultValue("")]
        public string Source { get; init; }

        [CommandOption("--lastChanged")]
        [Description("A valid timestamp for when the risk was last changed (example: 2021-06-17T01:37:16.594Z)")]
        [DefaultValue("")]
        public string LastChanged { get; init; }

        public override ValidationResult Validate()
        {
            if (string.IsNullOrEmpty(WellUid) && string.IsNullOrEmpty(LastChanged))
                return ValidationResult.Error("You need to filter on either uidWell/uidWellbore or last changed");

            if (!string.IsNullOrEmpty(LastChanged) && !DateTime.TryParse(LastChanged, out _))
                return ValidationResult.Error("Invalid format for last changed");

            return ValidationResult.Success();
        }
    }
}
