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
    public class ListWellboresCommand : AsyncCommand<ListWellboresCommand.ListWellboresSettings>
    {
        public class ListWellboresSettings : CommandSettings { }

        private readonly IWitsmlClient witsmlClient;

        public ListWellboresCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient() ?? throw new ArgumentNullException(nameof(witsmlClientProvider));
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListWellboresSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching active wellbores...".WithColor(Color.Orange1), async ctx =>
                {
                    await foreach (var wellbore in GetActiveWellbores())
                    {
                        table.AddRow(wellbore.UidWell, wellbore.Uid, wellbore.NameWell, wellbore.Name);
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
            table.AddColumn("WellboreUid".Bold());
            table.AddColumn("WellName".Bold());
            table.AddColumn("WellboreName".Bold());
            return table;
        }

        private async IAsyncEnumerable<WitsmlWellbore> GetActiveWellbores()
        {
            var liveLogsQuery = new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    Uid = "",
                    UidWell = "",
                    UidWellbore = "",
                    Name = "",
                    NameWell = "",
                    NameWellbore = "",
                    ObjectGrowing = "true"
                }.AsSingletonList()
            };
            var result = await witsmlClient.GetFromStoreAsync(liveLogsQuery, OptionsIn.Requested);
            var groupedResults = result.Logs
                .OrderBy(x => x.NameWell)
                .GroupBy(x => new{x.UidWell, x.UidWellbore})
                .Select(x => new
                {
                    UidWell = x.Key.UidWell,
                    UidWellbore = x.Key.UidWellbore,
                    Logs = x
                });

            foreach (var groupedResult in groupedResults)
            {
                yield return new WitsmlWellbore
                {
                    UidWell = groupedResult.UidWell,
                    Uid = groupedResult.UidWellbore,
                    NameWell = groupedResult.Logs.First().NameWell,
                    Name = groupedResult.Logs.First().NameWellbore
                };
            }
        }
    }
}
