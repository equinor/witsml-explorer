using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Spectre.Console;
using Spectre.Console.Cli;
using Witsml;
using Witsml.ServiceReference;
using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.QueryCommands
{
    public class GetQueryCommand : AsyncCommand<GetQuerySettings>
    {
        private readonly IWitsmlClient witsmlClient;

        public GetQueryCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetQuerySettings settings)
        {
            if (witsmlClient == null) return -1;

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Executing query...".WithColor(Color.Orange1), async _ =>
                {
                    var results = await ExecuteQuery(settings.QueryFile, settings.ReturnElements, settings.MaxReturnNodes);
                    await using var memoryStream = new MemoryStream();
                    await using var writer = new XmlTextWriter(memoryStream, Encoding.Unicode) {Formatting = Formatting.Indented};
                    var document = new XmlDocument();

                    document.LoadXml(results);
                    document.WriteContentTo(writer);
                    writer.Flush();
                    memoryStream.Flush();
                    memoryStream.Position = 0;

                    var streamReader = new StreamReader(memoryStream);
                    while (true)
                    {
                        var line = await streamReader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line)) break;

                        AnsiConsole.WriteLine(line);
                    }
                });

            return 0;
        }

        private async Task<string> ExecuteQuery(string queryFile, string returnElements, int? maxReturnNodes)
        {
            var queryPath = Path.Combine(Directory.GetCurrentDirectory(), queryFile);
            var query = await File.ReadAllTextAsync(queryPath);

            var returnElementsEnum = EnumParser<ReturnElements>.GetEnum(returnElements);
            var optionsIn = new OptionsIn(returnElementsEnum, maxReturnNodes);

            return await witsmlClient.GetFromStoreAsync(query, optionsIn);
        }
    }
}
