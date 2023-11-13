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
        private readonly IWitsmlClient _witsmlClient;

        public ListBhaRunsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListBhaRunsSettings settings)
        {
            if (_witsmlClient == null)
            {
                return -1;
            }

            Table table = CreateTable();

            string wellName = "<?>";
            string wellboreName = "<?>";
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching bha runs...".WithColor(Color.Orange1), async _ =>
                {
                    List<WitsmlBhaRun> bhaRuns = (await GetBhaRuns(settings.WellUid, settings.WellboreUid)).ToList();

                    wellName = bhaRuns.FirstOrDefault()?.NameWell;
                    wellboreName = bhaRuns.FirstOrDefault()?.NameWellbore;

                    foreach (WitsmlBhaRun bhaRun in bhaRuns.OrderBy(r => r.CommonData.DTimLastChange))
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
            AnsiConsole.Write(table);
            return 0;
        }

        private static Table CreateTable()
        {
            Table table = new();
            table.AddColumn("Uid".Bold());
            table.AddColumn("Name".Bold());
            table.AddColumn("TubularUid".Bold());
            table.AddColumn("LastChanged".Bold());
            return table;
        }

        private async Task<IEnumerable<WitsmlBhaRun>> GetBhaRuns(string wellUid, string wellboreUid)
        {
            WitsmlBhaRuns query = new()
            {
                BhaRuns = new WitsmlBhaRun
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = "",
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    Tubular = new WitsmlRefNameString
                    {
                        UidRef = ""
                    },
                    CommonData = new WitsmlCommonData
                    {
                        DTimLastChange = ""
                    }
                }.AsItemInList()
            };

            WitsmlBhaRuns result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result?.BhaRuns;
        }
    }
}
