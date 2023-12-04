using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

using Spectre.Console;
using Spectre.Console.Cli;

using Witsml;
using Witsml.Data.Tubular;
using Witsml.Extensions;
using Witsml.ServiceReference;

using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.ShowCommands
{
    public class ShowTubularCommand : AsyncCommand<ShowTubularSettings>
    {
        private readonly IWitsmlClient _witsmlClient;

        public ShowTubularCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ShowTubularSettings settings)
        {
            if (_witsmlClient == null)
            {
                return -1;
            }

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching tubular...".WithColor(Color.Orange1), async _ =>
                {
                    WitsmlTubular tubular = await GetTubular(settings.WellUid, settings.WellboreUid, settings.TubularUid);
                    JsonSerializerOptions jsonSerializerOptions = new()
                    {
                        WriteIndented = true
                    };

                    AnsiConsole.WriteLine(JsonSerializer.Serialize(tubular, jsonSerializerOptions));
                });

            return 0;
        }

        private async Task<WitsmlTubular> GetTubular(string wellUid, string wellboreUid, string tubularUid)
        {
            WitsmlTubulars query = new()
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsItemInList()
            };

            WitsmlTubulars result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return result?.Tubulars.FirstOrDefault();
        }
    }
}
