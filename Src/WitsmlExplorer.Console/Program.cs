using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console.Cli;
using WitsmlExplorer.Console.ListCommands;
using WitsmlExplorer.Console.Injection;
using WitsmlExplorer.Console.ShowCommands;
using WitsmlExplorer.Console.WitsmlClient;

namespace WitsmlExplorer.Console
{
    class Program
    {
        static async Task<int> Main(string[] args)
        {
            var app = new CommandApp(RegisterServices());
            app.Configure(config => ConfigureCommands(config));

            return await app.RunAsync(args).ConfigureAwait(false);
        }

        private static IConfigurator ConfigureCommands(IConfigurator config)
        {
            config.CaseSensitivity(CaseSensitivity.None);
            config.SetApplicationName("dotnet run --");

            config.AddBranch("list", add =>
            {
                add.AddCommand<ListWellboresCommand>("wellbores").WithDescription("List active wellbores");
                add.AddCommand<ListLogsCommand>("logs").WithDescription("List logs within a well/wellbore");
                add.AddCommand<ListTubularsCommand>("tubulars").WithDescription("List tubulars within a well/wellbore");
            });

            config.AddBranch("show", add =>
            {
                add.AddCommand<ShowTubularCommand>("tubular").WithDescription("Export tubular within a well/wellbore");
            });
            return config;
        }

        private static ITypeRegistrar RegisterServices()
        {
            var services = new ServiceCollection();
            services.AddSingleton<IWitsmlClientProvider, WitsmlClientProvider>();

            return new TypeRegistrar(services);
        }
    }
}
