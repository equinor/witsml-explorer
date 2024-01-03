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
        private readonly IWitsmlClient _witsmlClient;

        public ListLogsCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ListLogsSettings settings)
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
                .StartAsync("Fetching logs...".WithColor(Color.Orange1), async _ =>
                {
                    IList<WitsmlLog> logs = await GetLogs(settings.WellUid, settings.WellboreUid);

                    wellName = logs.FirstOrDefault()?.NameWell;
                    wellboreName = logs.FirstOrDefault()?.NameWellbore;

                    string previousIndexType = "";
                    foreach (WitsmlLog log in logs.OrderBy(l => l.IndexType))
                    {
                        if (!string.IsNullOrEmpty(previousIndexType) && log.IndexType != previousIndexType)
                        {
                            table.AddEmptyRow();
                        }

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
            AnsiConsole.Write(table);
            return 0;
        }

        private static Table CreateTable()
        {
            Table table = new();
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
            WitsmlLogs query = new()
            {
                Logs = new WitsmlLog
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsItemInList()
            };

            WitsmlLogs result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs;
        }
    }
}
