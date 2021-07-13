using System;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;
using Spectre.Console;
using Spectre.Console.Cli;
using Witsml;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Console.Extensions;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console.QueryCommands
{
    public class GetQueryCommand : AsyncCommand<GetQueryCommand.QuerySettings>
    {
        public class QuerySettings : CommandSettings
        {
            private readonly string[] validReturnElements = {"requested", "all", "id-only", "header-only", "data-only", "station-location-only", "latest-change-only"};

            [CommandArgument(0, "<PATH_TO_QUERY_FILE>")]
            [Description("Path to query file in XML format")]
            public string QueryFile { get; init; }

            [CommandOption("--returnElements")]
            [Description("Indicates which elements and attributes are requested to be returned in addition to data-object selection items [requested(default)|all|id-only|header-only|data-only|station-location-only|latest-change-only")]
            [DefaultValue("requested")]
            public string ReturnElements { get; init; }

            [CommandOption("--maxReturnNodes")]
            [Description("Max number of data nodes to return. Must be a whole number greater than zero, if provided")]
            public int? MaxReturnNodes { get; init; }

            public override ValidationResult Validate()
            {
                var queryPath = Path.Combine(Directory.GetCurrentDirectory(), QueryFile);
                if (!File.Exists(queryPath))
                    return ValidationResult.Error($"Could not find query file: {queryPath}");

                if (!validReturnElements.Contains(ReturnElements))
                    return ValidationResult.Error($"Invalid value for returnElements ({ReturnElements})");

                if (MaxReturnNodes is < 1)
                    return ValidationResult.Error("MaxReturnNodes must be a whole number greater than zero");

                return ValidationResult.Success();
            }
        }

        private readonly IWitsmlClient witsmlClient;

        public GetQueryCommand(IWitsmlClientProvider witsmlClientProvider)
        {
            witsmlClient = witsmlClientProvider?.GetClient();
        }

        public override async Task<int> ExecuteAsync(CommandContext context, QuerySettings settings)
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
