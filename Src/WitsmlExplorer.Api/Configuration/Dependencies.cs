using System;
using System.Reflection;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using NetCore.AutoRegisterDi;

using Serilog;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

namespace WitsmlExplorer.Api.Configuration
{
    public static class Dependencies
    {
        private const string MissingDatabaseConfigMessage = "Did not detect any configuration for database";

        public static void ConfigureDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.RegisterAssemblyPublicNonGenericClasses(Assembly.GetAssembly(typeof(Program)))
                .IgnoreThisInterface<ICopyLogDataWorker>()
                .IgnoreThisInterface<ICredentials>()
                .IgnoreThisInterface<ICredentialsService>()
                .IgnoreThisInterface<IJobCache>()
                .IgnoreThisInterface<IJobQueue>()
                .IgnoreThisInterface<IWitsmlSystemCredentials>()
                .IgnoreThisInterface<IWitsmlClientProvider>()
                .IgnoreThisInterface<ICredentialsCache>()
                .IgnoreThisInterface<IAsyncDisposable>()
                .AsPublicImplementedInterfaces();
            AddRepository<Server, Guid>(services, configuration);
            AddRepository<LogCurvePriority, string>(services, configuration);
            AddRepository<UidMappingCollection, string>(services, configuration);
            AddRepository<AgentSettingsDocument, string>(services, configuration);
            services.AddSingleton<ICredentialsService, CredentialsService>();
            services.AddSingleton<IJobCache, JobCache>();
            services.AddSingleton<IJobQueue, JobQueue>();
            services.AddSingleton<IWitsmlSystemCredentials, WitsmlSystemCredentials>();
            services.AddScoped<IWitsmlClientProvider, WitsmlClientProvider>();
            services.AddSingleton<ICredentialsCache, CredentialsCache>();
            services.AddSingleton<IJobProgressService, JobProgressService>();
            services.AddScoped<IUidMappingService, UidMappingService>();
        }

        private static void AddRepository<TDocument, T>(IServiceCollection services, IConfiguration configuration) where TDocument : DbDocument<T>
        {
            if (!string.IsNullOrEmpty(configuration["MongoDb:Name"]))
            {
                Log.Information("Detected database config for MongoDB");
                services.AddSingleton<IDocumentRepository<TDocument, T>, MongoRepository<TDocument, T>>();
            }
            else if (!string.IsNullOrEmpty(configuration["CosmosDb:Name"]))
            {
                Log.Information("Detected database config for CosmosDB");
                services.AddSingleton<IDocumentRepository<TDocument, T>, CosmosRepository<TDocument, T>>();
            }
            else if (!string.IsNullOrEmpty(configuration["LiteDb:Name"]))
            {
                Log.Information("Detected database config for LiteDB");
                services.AddSingleton<IDocumentRepository<TDocument, T>, LiteDbRepository<TDocument, T>>();
            }
            else
            {
                Log.Error(MissingDatabaseConfigMessage);
                throw new ApplicationException(MissingDatabaseConfigMessage);
            }

        }

        public static void InitializeRepository(this IApplicationBuilder app)
        {
            IDocumentRepository<Server, Guid> serverRepository = app.ApplicationServices.GetService<IDocumentRepository<Server, Guid>>();
            serverRepository?.InitClientAsync().GetAwaiter().GetResult();

            IDocumentRepository<LogCurvePriority, string> logCurvePriorityRepository = app.ApplicationServices.GetService<IDocumentRepository<LogCurvePriority, string>>();
            logCurvePriorityRepository?.InitClientAsync().GetAwaiter().GetResult();

            IDocumentRepository<UidMappingCollection, string> uidMappingCollectionRepository = app.ApplicationServices.GetService<IDocumentRepository<UidMappingCollection, string>>();
            uidMappingCollectionRepository?.InitClientAsync().GetAwaiter().GetResult();

            IDocumentRepository<AgentSettingsDocument, Guid> agentSettingsRepository = app.ApplicationServices.GetService<IDocumentRepository<AgentSettingsDocument, Guid>>();
            agentSettingsRepository?.InitClientAsync().GetAwaiter().GetResult();
        }
    }
}
