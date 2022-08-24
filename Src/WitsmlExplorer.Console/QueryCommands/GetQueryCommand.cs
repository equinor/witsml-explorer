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
        private readonly IWitsmlClient _witsmlClient;

        public GetQueryCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            _witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, GetQuerySettings settings)
        {
            if (_witsmlClient == null)
            {
                return -1;
            }

            await AnsiConsole.Status()
                .Spinner(Spinner.Known.Dots)
                .StartAsync("Executing query...".WithColor(Color.Orange1), async _ =>
                {
                    string results = await ExecuteQuery(settings.QueryFile, settings.ReturnElements, settings.MaxReturnNodes);
                    await using MemoryStream memoryStream = new();
                    await using XmlTextWriter writer = new(memoryStream, Encoding.Unicode) { Formatting = Formatting.Indented };
                    XmlDocument document = new();

                    document.LoadXml(results);
                    document.WriteContentTo(writer);
                    writer.Flush();
                    memoryStream.Flush();
                    memoryStream.Position = 0;

                    StreamReader streamReader = new(memoryStream);
                    while (true)
                    {
                        string line = await streamReader.ReadLineAsync();
                        if (string.IsNullOrEmpty(line))
                        {
                            break;
                        }

                        AnsiConsole.WriteLine(line);
                    }
                });

            return 0;
        }

        private async Task<string> ExecuteQuery(string queryFile, string returnElements, int? maxReturnNodes)
        {
            string queryPath = Path.Combine(Directory.GetCurrentDirectory(), queryFile);
            string query = await File.ReadAllTextAsync(queryPath);

            ReturnElements returnElementsEnum = EnumParser<ReturnElements>.GetEnum(returnElements);
            OptionsIn optionsIn = new(returnElementsEnum, maxReturnNodes);

            return await _witsmlClient.GetFromStoreAsync(query, optionsIn);
        }
    }
}
