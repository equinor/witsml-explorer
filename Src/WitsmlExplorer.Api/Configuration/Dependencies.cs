using System;
using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NetCore.AutoRegisterDi;
using Serilog;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api.Configuration
{
    public static class Dependencies
    {
        public static void ConfigureDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<ICredentialsService, CredentialsService>();
            services.AddScoped<IWitsmlClientProvider, WitsmlClientProvider>();
            AddRepository<Server, Guid>(services, configuration);
            services.RegisterAssemblyPublicNonGenericClasses(Assembly.GetAssembly(typeof(Program))).AsPublicImplementedInterfaces();
            services.AddSingleton<IJobQueue, JobQueue>();
        }

        private static void AddRepository<TDocument, I>(IServiceCollection services, IConfiguration configuration) where TDocument : DbDocument<I>
        {
            if (!string.IsNullOrEmpty(configuration["MongoDb:Name"]))
            {
                Log.Information("Detected database config for MongoDB");
                services.AddSingleton<IDocumentRepository<TDocument, I>, MongoRepository<TDocument, I>>();
            }
            else if (!string.IsNullOrEmpty(configuration["CosmosDb:Name"]))
            {
                Log.Information("Detected database config for CosmosDB");
                services.AddSingleton<IDocumentRepository<TDocument, I>, CosmosRepository<TDocument, I>>();
            }
            else
            {
                Log.Error("Did not detect any configuration for database");
                return;
            }

            var serviceProvider = services.BuildServiceProvider();
            var repository = serviceProvider.GetService<IDocumentRepository<TDocument, I>>();
            repository?.InitClient();
        }
    }
}
