using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Spectre.Console;
using Spectre.Console.Cli;

using Witsml;
using Witsml.Data;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.ListCommands
{
    public class ListTubularsCommand : AsyncCommand<ListTubularsSettings>
    {
        private readonly IWitsmlClient _witsmlClient;

        public ListTubularsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListTubularsSettings settings)
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
                .StartAsync("Fetching tubulars...".WithColor(Color.Orange1), async _ =>
                {
                    List<WitsmlTubular> tubulars = (await GetTubulars(settings.WellUid, settings.WellboreUid)).ToList();

                    wellName = tubulars.FirstOrDefault()?.NameWell;
                    wellboreName = tubulars.FirstOrDefault()?.NameWellbore;

                    foreach (WitsmlTubular tubular in tubulars.OrderBy(l => l.Name))
                    {
                        table.AddRow(
                            tubular.Uid,
                            tubular.Name,
                            tubular.TypeTubularAssy,
                            tubular.CommonData.DTimLastChange);
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
            table.AddColumn("TypeTubularAssy".Bold());
            table.AddColumn("LastChanged".Bold());
            return table;
        }

        private async Task<IEnumerable<WitsmlTubular>> GetTubulars(string wellUid, string wellboreUid)
        {
            WitsmlTubulars query = new()
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Uid = "",
                    NameWell = "",
                    NameWellbore = "",
                    Name = "",
                    TypeTubularAssy = "",
                    CommonData = new WitsmlCommonData
                    {
                        DTimLastChange = ""
                    }
                }.AsItemInList()
            };

            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return result?.Tubulars;
        }
    }
}
