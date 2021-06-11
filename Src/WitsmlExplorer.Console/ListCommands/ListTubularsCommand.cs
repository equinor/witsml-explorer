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
    public class ListTubularsCommand : AsyncCommand<ListTubularsCommand.ListTubularsSettings>
    {
        public class ListTubularsSettings : CommandSettings
        {
            [CommandArgument(0, "<WELL_UID>")]
            public string WellUid { get; init; }

            [CommandArgument(1, "<WELLBORE_UID>")]
            public string WellboreUid { get; init; }
        }

        private readonly IWitsmlClient witsmlClient;

        public ListTubularsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListTubularsSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            var wellName = "<?>";
            var wellboreName = "<?>";
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching tubulars...".WithColor(Color.Orange1), async ctx =>
                {
                    var tubulars = (await GetTubulars(settings.WellUid, settings.WellboreUid)).ToList();

                    wellName = tubulars.FirstOrDefault()?.NameWell;
                    wellboreName = tubulars.FirstOrDefault()?.NameWellbore;

                    foreach (var tubular in tubulars.OrderBy(l => l.Name))
                    {
                        table.AddRow(
                            tubular.Uid,
                            tubular.Name,
                            tubular.TypeTubularAssy);
                    }
                });

            AnsiConsole.WriteLine();
            AnsiConsole.MarkupLine($"{"Well UID:".Bold()} {settings.WellUid}");
            AnsiConsole.MarkupLine($"{"Wellbore UID:".Bold()} {settings.WellboreUid}");
            AnsiConsole.MarkupLine($"{"Well name:".Bold()} {wellName}");
            AnsiConsole.MarkupLine($"{"Wellbore name:".Bold()} {wellboreName}");
            AnsiConsole.Render(table);
            return 0;
        }

        private static Table CreateTable()
        {
            var table = new Table();
            table.AddColumn("Uid".Bold());
            table.AddColumn("Name".Bold());
            table.AddColumn("TypeTubularAssy".Bold());
            return table;
        }

        private async Task<IEnumerable<WitsmlTubular>> GetTubulars(string wellUid, string wellboreUid)
        {
            var query = new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = "",
                    Name = "",
                    TypeTubularAssy = ""
                }.AsSingletonList()
            };

            var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.Requested);
            return result?.Tubulars;
        }
    }
}
