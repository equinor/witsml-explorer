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
    public class ListBhaRunsCommand : AsyncCommand<ListBhaRunsSettings>
    {
        private readonly IWitsmlClient witsmlClient;

        public ListBhaRunsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListBhaRunsSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            var wellName = "<?>";
            var wellboreName = "<?>";
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching bha runs...".WithColor(Color.Orange1), async _ =>
                {
                    var bhaRuns = (await GetBhaRuns(settings.WellUid, settings.WellboreUid)).ToList();

                    wellName = bhaRuns.FirstOrDefault()?.NameWell;
                    wellboreName = bhaRuns.FirstOrDefault()?.NameWellbore;

                    foreach (var bhaRun in bhaRuns.OrderBy(r => r.CommonData.DTimLastChange))
                    {
                        table.AddRow(
                            bhaRun.Uid,
                            bhaRun.Name,
                            bhaRun.Tubular.UidRef,
                            bhaRun.CommonData.DTimLastChange);
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
            table.AddColumn("TubularUid".Bold());
            table.AddColumn("LastChanged".Bold());
            return table;
        }

        private async Task<IEnumerable<WitsmlBhaRun>> GetBhaRuns(string wellUid, string wellboreUid)
        {
            var query = new WitsmlBhaRuns
            {
                BhaRuns = new WitsmlBhaRun
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = "",
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    Tubular = new WitsmlObjectReference
                    {
                        UidRef = ""
                    },
                    CommonData = new WitsmlCommonData
                    {
                        DTimLastChange = ""
                    }
                }.AsSingletonList()
            };

            var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.Requested);
            return result?.BhaRuns;
        }
    }
}
