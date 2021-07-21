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
    public class ListLogsCommand : AsyncCommand<ListLogsSettings>
    {
        private readonly IWitsmlClient witsmlClient;

        public ListLogsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListLogsSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            var wellName = "<?>";
            var wellboreName = "<?>";
            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching logs...".WithColor(Color.Orange1), async _ =>
                {
                    var logs = await GetLogs(settings.WellUid, settings.WellboreUid);

                    wellName = logs.FirstOrDefault()?.NameWell;
                    wellboreName = logs.FirstOrDefault()?.NameWellbore;

                    var previousIndexType = "";
                    foreach (var log in logs.OrderBy(l => l.IndexType))
                    {
                        if (!string.IsNullOrEmpty(previousIndexType) && log.IndexType != previousIndexType)
                            table.AddEmptyRow();

                        if (log.ObjectGrowing == "true")
                        {
                            table.AddRow(
                                log.Uid.WithColor(Color.Green),
                                log.Name.WithColor(Color.Green),
                                log.ServiceCompany.WithColor(Color.Green) ?? "",
                                log.GetStartIndexAsString().WithColor(Color.Green),
                                log.GetEndIndexAsString().WithColor(Color.Green),
                                log.ObjectGrowing == "true" ? ":check_mark:".WithColor(Color.Green) : "");
                        }
                        else
                        {
                            table.AddRow(
                                log.Uid,
                                log.Name,
                                log.ServiceCompany ?? "",
                                log.GetStartIndexAsString(),
                                log.GetEndIndexAsString(),
                                log.ObjectGrowing == "true" ? ":check_mark:" : "");
                        }

                        previousIndexType = log.IndexType;
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

        private Table CreateTable()
        {
            var table = new Table();
            table.AddColumn("Uid".Bold());
            table.AddColumn("Name".Bold());
            table.AddColumn("Service company".Bold());
            table.AddColumn("Start index".Bold());
            table.AddColumn("End index".Bold());
            table.AddColumn("Growing".Bold());
            return table;
        }

        private async Task<IList<WitsmlLog>> GetLogs(string wellUid, string wellboreUid)
        {
            var query = new WitsmlLogs
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };

            var result = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs;
        }
    }
}
