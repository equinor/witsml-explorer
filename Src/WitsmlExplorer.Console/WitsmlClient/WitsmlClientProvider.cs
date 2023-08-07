using System;
using System.IO;
using System.Reflection;

using Microsoft.Extensions.Configuration;

using Spectre.Console;

using Witsml;
using Witsml.Data;

using WitsmlExplorer.Console.Extensions;

namespace WitsmlExplorer.Console.WitsmlClient
{
    public interface IWitsmlClientProvider
    {
        IWitsmlClient GetClient();
    }

    public class WitsmlClientProvider : IWitsmlClientProvider
    {
        private readonly IWitsmlClient _witsmlClient;

        private readonly WitsmlClientCapabilities _clientCapabilities = new()
        {
            Name = "Witsml Explorer CLI",
            Description = "CLI interface for Witsml servers"
        };

        public WitsmlClientProvider()
        {
            try
            {
                (string serverUrl, string username, string password) = GetCredentialsFromConfiguration();
                _witsmlClient = new Witsml.WitsmlClient(options =>
                {
                    options.Hostname = serverUrl;
                    options.Credentials = new WitsmlCredentials(username, password);
                    options.ClientCapabilities = _clientCapabilities;
                });
            }
            catch (Exception e)
            {
                WriteMissingConfigurationMessage(e.Message);
            }
        }

        private static (string, string, string) GetCredentialsFromConfiguration()
        {
            string assemblyFolder = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            ConfigurationBuilder builder = new();
            builder.SetBasePath(assemblyFolder)
                .AddJsonFile("appsettings.witsml.json", false, true);
            IConfigurationRoot configuration = builder.Build();

            string serverUrl = configuration["Witsml:Host"];
            string username = configuration["Witsml:Username"];
            string password = configuration["Witsml:Password"];

            return string.IsNullOrEmpty(serverUrl)
                ? throw new ApplicationException("Missing configuration value for Witsml Host")
                : string.IsNullOrEmpty(username)
                ? throw new ApplicationException("Missing configuration value for Witsml Username")
                : string.IsNullOrEmpty(password)
                ? throw new AggregateException("Missing configuration value for Witsml Password")
                : ((string, string, string))(serverUrl, username, password);
        }

        private static void WriteMissingConfigurationMessage(string exceptionMessage)
        {
            AnsiConsole.MarkupLine($"\nError: {exceptionMessage}\n".WithColor(Color.Red));
            AnsiConsole.MarkupLine("The configuration file should contain:");
            AnsiConsole.MarkupLine("{\n  \"Witsml\": {");
            AnsiConsole.MarkupLine("    \"Host\": \"<WITSML SERVER URL>\",");
            AnsiConsole.MarkupLine("    \"Username\": \"<WITSML USERNAME>\",");
            AnsiConsole.MarkupLine("    \"Password\": \"<WITSML PASSWORD>\"");
            AnsiConsole.MarkupLine("  }\n}");
        }

        IWitsmlClient IWitsmlClientProvider.GetClient()
        {
            return _witsmlClient;
        }
    }
}
