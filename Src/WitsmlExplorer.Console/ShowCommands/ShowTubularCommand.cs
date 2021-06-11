using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Spectre.Console;
using Spectre.Console.Cli;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.ShowCommands
{
    public class ShowTubularCommand : AsyncCommand<ShowTubularCommand.ExportTubularSettings>
    {
        public class ExportTubularSettings : CommandSettings
        {
            [CommandArgument(0, "<WELL_UID>")]
            public string WellUid { get; init; }

            [CommandArgument(1, "<WELLBORE_UID>")]
            public string WellboreUid { get; init; }

            [CommandArgument(2, "<TUBULAR_UID>")]
            public string TubularUid { get; init; }
        }

        private readonly IWitsmlClient witsmlClient;

        public ShowTubularCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ExportTubularSettings settings)
        {
            if (witsmlClient == null) return -1;

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching tubular...".WithColor(Color.Orange1), async ctx =>
                {
                    var tubular = await GetTubular(settings.WellUid, settings.WellboreUid, settings.TubularUid);
                    var jsonSerializerOptions = new JsonSerializerOptions
                    {
                        WriteIndented = true
                    };

                    AnsiConsole.WriteLine(JsonSerializer.Serialize(tubular, jsonSerializerOptions));
                });

            return 0;
        }

        private async Task<WitsmlTubular> GetTubular(string wellUid, string wellboreUid, string tubularUid)
        {
            var query = new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };

            var result = await witsmlClient.GetFromStoreAsync(query, OptionsIn.All);
            return result?.Tubulars.FirstOrDefault();
        }
    }
}
