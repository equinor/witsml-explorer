using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using Spectre.Console;
using Spectre.Console.Cli;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.ListCommands
{
    public class ListRisksCommand : AsyncCommand<ListRisksCommand.ListRisksSettings>
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

        private readonly IWitsmlClient witsmlClient;

        public ListRisksCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListRisksSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            IList<WitsmlRisk> risks = new List<WitsmlRisk>();
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching risks...".WithColor(Color.Orange1), async ctx =>
                {
                    risks = await GetRisks(settings.WellUid, settings.WellboreUid, settings.Source, settings.LastChanged);

                    if (risks.Count > 100)
                    {
                        AnsiConsole.MarkupLine($"\nToo many risks returned ({risks.Count}). Please filter your query".WithColor(Color.Red1));
                    }

                    foreach (var risk in risks)
                    {
                        table.AddRow(
                            risk.Uid,
                            risk.UidWell,
                            risk.UidWellbore,
                            risk.NameWellbore,
                            risk.Summary,
                            risk.CommonData.SourceName ?? "",
                            risk.CommonData.DTimLastChange);
                    }
                });

            if (risks.Any())
                AnsiConsole.Render(table);
            return 0;
        }

        private static Table CreateTable()
        {
            var table = new Table();
            table.AddColumn("Uid".Bold());
            table.AddColumn("UidWell".Bold());
            table.AddColumn("UidWellbore".Bold());
            table.AddColumn("WellboreName".Bold());
            table.AddColumn("Summary".Bold());
            table.AddColumn("Source".Bold());
            table.AddColumn("Last changed".Bold());
            return table;
        }

        private async Task<IList<WitsmlRisk>> GetRisks(string wellUid, string wellboreUid, string source, string lastChanged)
        {
            var query = new WitsmlRisks
            {
                Risks = new WitsmlRisk
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    CommonData = new WitsmlCommonData
                    {
                        SourceName = source,
                        DTimLastChange = lastChanged
                    }
                }.AsSingletonList()
            };

            try
            {
                var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.All);
                return result?.Risks
                    .OrderBy(risk => risk.NameWellbore)
                    .ThenBy(risk => DateTime.Parse(risk.CommonData.DTimLastChange))
                    .ToList();
            }
            catch (TimeoutException)
            {
                AnsiConsole.MarkupLine("\nThe request timed out. You might need to filter your request to reduce the query result".WithColor(Color.Red1));
                return new List<WitsmlRisk>();
            }
        }
    }
}
