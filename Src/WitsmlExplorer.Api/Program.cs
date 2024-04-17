using System.IO;
using System.Security.Cryptography;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

using Serilog;

using WitsmlExplorer.Api;
using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

var configPath = builder.Configuration["CONFIG_PATH"];

if (configPath != null)
{
    builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile(configPath, false, true)
        .AddEnvironmentVariables();
}
else
{
    builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", false, true)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true, true)
            .AddJsonFile("mysettings.json", true, true)
            .AddJsonFile("config.json", true, true)
            .AddEnvironmentVariables();
}

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Startup>();
}

if (StringHelpers.ToBoolean(builder.Configuration[ConfigConstants.OAuth2Enabled]))
{
    builder.Configuration.AddAzureWitsmlServerCreds();
    builder.Configuration[ConfigConstants.NotificationsKey] = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));
}
builder.Logging.ClearProviders();
string appName = builder.Configuration["Witsml:ClientCapabilities:Name"] ?? "Witsml Explorer";
builder.Host.UseSerilog((hostingContext, loggerConfiguration) => loggerConfiguration.ReadFrom.Configuration(hostingContext.Configuration)
.Enrich.WithProperty("Env", builder.Environment.EnvironmentName)
.Enrich.WithProperty("App", appName));

Startup startup = new(builder.Configuration);
startup.ConfigureServices(builder.Services);

WebApplication app = builder.Build();
app.ConfigureApi(builder.Configuration);

startup.Configure(app, app.Environment);

app.Run();
