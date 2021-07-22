using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Witsml.Data;

namespace WitsmlExplorer.Api
{
    public class Program
    {
        private static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .ConfigureAppConfiguration(ConfigConfiguration)
                .ConfigureServices(ConfigureServices)
                .UseSerilog((hostingContext, loggerConfiguration) => loggerConfiguration.ReadFrom.Configuration(hostingContext.Configuration))
                .UseKestrel()
                .Build();

        private static void ConfigureServices(WebHostBuilderContext context, IServiceCollection services)
        {
            services.Configure<WitsmlClientCapabilities>(context.Configuration.GetSection("Witsml:ClientCapabilities"));
        }

        private static void ConfigConfiguration(WebHostBuilderContext context, IConfigurationBuilder configurationBuilder)
        {
            configurationBuilder
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", false, true)
                .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", true, true)
                .AddJsonFile("mysettings.json", true, true)
                .AddJsonFile("config.json", true, true)
                .AddEnvironmentVariables();

            if (context.HostingEnvironment.IsDevelopment())
            {
                configurationBuilder.AddUserSecrets<Startup>();
            }
        }

        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }
    }
}
