using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Spectre.Console;
using Spectre.Console.Cli;
using Witsml;
using Witsml.Data;
using Witsml.ServiceReference;
using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.ShowCommands
{
    public class ShowLogHeaderCommand : AsyncCommand<ShowLogHeaderSettings>
    {
        private readonly IWitsmlClient witsmlClient;

        public ShowLogHeaderCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, ShowLogHeaderSettings settings)
        {
            if (witsmlClient == null) return -1;

            var table = CreateTable();

            var wellName = "<?>";
            var wellboreName = "<?>";
            var logName = "<?>";

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Fetching log...".WithColor(Color.Orange1), async _ =>
                {
                    var log = await GetLogHeader(settings.WellUid, settings.WellboreUid, settings.LogUid);
                    wellName = log.NameWell;
                    wellboreName = log.NameWellbore;
                    logName = log.Name;

                    var list = settings.OrderByEndIndex
                        ? log.LogCurveInfo.OrderByDescending(lci => DateTime.Parse(lci.MaxDateTimeIndex)).ToList()
                        : log.LogCurveInfo;


                    foreach (var logCurveInfo in list.Take(settings.MaxMnemonics))
                    {
                        if (!string.IsNullOrEmpty(settings.FilterOnMnemonic) && logCurveInfo.Mnemonic != settings.FilterOnMnemonic)
                            continue;

                        table.AddRow(
                            logCurveInfo.Mnemonic,
                            logCurveInfo.MinDateTimeIndex ?? $"{logCurveInfo.MinIndex.Value}{logCurveInfo.MinIndex.Uom}",
                            logCurveInfo.MaxDateTimeIndex ?? $"{logCurveInfo.MaxIndex.Value}{logCurveInfo.MaxIndex.Uom}"
                        );
                    }
                });

            AnsiConsole.WriteLine();
            AnsiConsole.MarkupLine($"{"Well UID:".Bold()} {settings.WellUid}");
            AnsiConsole.MarkupLine($"{"Wellbore UID:".Bold()} {settings.WellboreUid}");
            AnsiConsole.MarkupLine($"{"Log UID".Bold()} {settings.LogUid}");
            AnsiConsole.MarkupLine($"{"Well name:".Bold()} {wellName}");
            AnsiConsole.MarkupLine($"{"Wellbore name:".Bold()} {wellboreName}");
            AnsiConsole.MarkupLine($"{"Log name:".Bold()} {logName}");
            AnsiConsole.Write(table);

            return 0;
        }

        private Table CreateTable()
        {
            var table = new Table();
            table.AddColumn("Mnemonic".Bold());
            table.AddColumn("Start index".Bold());
            table.AddColumn("End index".Bold());
            return table;
        }

        private async Task<WitsmlLog> GetLogHeader(string wellUid, string wellboreUid, string logUid)
        {
            var query = new WitsmlLogs
            {
                Logs = new List<WitsmlLog>
                {
                    new()
                    {
                        Uid = logUid,
                        UidWell = wellUid,
                        UidWellbore = wellboreUid
                    }
                }
            };

            var result = await witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.HeaderOnly));
            return result?.Logs.FirstOrDefault();
        }
    }
}
