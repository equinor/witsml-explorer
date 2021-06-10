using System;
using System.Collections.Generic;
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
    public class ListWellsCommand : AsyncCommand<ListWellsCommand.ListWellsSettings>
    {
        public class ListWellsSettings : CommandSettings { }

        private readonly IWitsmlClient witsmlClient;

        public ListWellsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient() ?? throw new ArgumentNullException(nameof(witsmlClientProvider));
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListWellsSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching wells...".WithColor(Color.Orange1), async ctx =>
                {
                    await foreach (var well in GetWells())
                    {
                        table.AddRow(well.Uid, well.Operator, well.Country, well.Field, well.Name);
                    }
                });
            AnsiConsole.WriteLine();
            AnsiConsole.Render(table);
            return 0;
        }

        private Table CreateTable()
        {
            var table = new Table();
            table.AddColumn("WellUid".Bold());
            table.AddColumn("Operator".Bold());
            table.AddColumn("Field".Bold());
            table.AddColumn("Country".Bold());
            table.AddColumn("WellName".Bold());
            return table;
        }

        private async IAsyncEnumerable<WitsmlWell> GetWells()
        {
            var wellsQuery = new WitsmlWells
            {
                Wells = new WitsmlWell
                {
                    Uid = "",
                    Name = "",
                    Field = "",
                    Country = "",
                    Operator = ""
                }.AsSingletonList()
            };
            var result = await witsmlClient.GetFromStoreAsync(wellsQuery, OptionsIn.Requested);
            foreach (var res in result.Wells)
            {
                yield return new WitsmlWell
                {
                    Uid = res.Uid,
                    Name = res.Name,
                    Field = res.Field == null ? "" : res.Field,
                    Country = res.Country == null ? "" : res.Country,
                    Operator = res.Operator == null ? "" : res.Operator
                };
            }
        }
    }
}
