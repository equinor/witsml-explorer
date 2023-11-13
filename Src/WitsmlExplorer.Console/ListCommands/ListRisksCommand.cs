using System;
using System.Collections.Generic;
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
    public class ListRisksCommand : AsyncCommand<ListRisksSettings>
    {
        private readonly IWitsmlClient _witsmlClient;

        public ListRisksCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListRisksSettings settings)
        {
            if (_witsmlClient == null)
            {
                return -1;
            }

            Table table = CreateTable();

            IList<WitsmlRisk> risks = new List<WitsmlRisk>();
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching risks...".WithColor(Color.Orange1), async _ =>
                {
                    risks = await GetRisks(settings.WellUid, settings.WellboreUid, settings.Source, settings.LastChanged);

                    if (risks.Count > 100)
                    {
                        AnsiConsole.MarkupLine($"\nToo many risks returned ({risks.Count}). Please filter your query".WithColor(Color.Red1));
                    }

                    foreach (WitsmlRisk risk in risks)
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
            {
                AnsiConsole.Write(table);
            }

            return 0;
        }

        private static Table CreateTable()
        {
            Table table = new();
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
            WitsmlRisks query = new()
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
                }.AsItemInList()
            };

            try
            {
                WitsmlRisks result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
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
