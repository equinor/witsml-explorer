using System;
using System.IO;
using System.Reflection.Metadata;
using Microsoft.Extensions.Configuration;
using Spectre.Console;
using Witsml;
using WitsmlExplorer.Console.Extensions;

namespace WitsmlExplorer.Console.WitsmlClient
{
    public interface IWitsmlClientProvider
    {
        IWitsmlClient GetClient();
    }

    public class WitsmlClientProvider : IWitsmlClientProvider
    {
        private readonly IWitsmlClient witsmlClient;

        public WitsmlClientProvider()
        {
            try
            {
                var (serverUrl, username, password) = GetCredentialsFromConfiguration();
                witsmlClient = new Witsml.WitsmlClient(serverUrl, username, password);
            }
            catch (Exception e)
            {
                WriteMissingConfigurationMessage(e.Message);
            }
        }

        private (string, string, string) GetCredentialsFromConfiguration()
        {
            var builder = new ConfigurationBuilder();
            builder.SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.witsml.json", false, true);
            var configuration = builder.Build();

            var serverUrl = configuration["Witsml:Host"];
            var username = configuration["Witsml:Username"];
            var password = configuration["Witsml:Password"];

            if (string.IsNullOrEmpty(serverUrl))
                throw new ApplicationException("Missing configuration value for Witsml Host");
            if (string.IsNullOrEmpty(username))
                throw new ApplicationException("Missing configuration value for Witsml Username");
            if (string.IsNullOrEmpty(password))
                throw new AggregateException("Missing configuration value for Witsml Password");

            return (serverUrl, username, password);
        }

        public IWitsmlClient GetClient() => witsmlClient;

        private void WriteMissingConfigurationMessage(string exceptionMessage)
        {
            AnsiConsole.MarkupLine($"\nError: {exceptionMessage}\n".WithColor(Color.Red));
            AnsiConsole.MarkupLine("The configuration file should contain:");
            AnsiConsole.MarkupLine("{\n  \"Witsml\": {");
            AnsiConsole.MarkupLine("    \"Host\": \"<WITSML SERVER URL>\",");
            AnsiConsole.MarkupLine("    \"Username\": \"<WITSML USERNAME>\",");
            AnsiConsole.MarkupLine("    \"Password\": \"<WITSML PASSWORD>\"");
            AnsiConsole.MarkupLine("  }\n}");
        }
    }
}
