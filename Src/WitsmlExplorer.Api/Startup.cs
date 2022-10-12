using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;

using Serilog;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Swagger;
using WitsmlExplorer.Api.Workers;
using WitsmlExplorer.Api.Workers.Copy;

namespace WitsmlExplorer.Api
{
    public class Startup
    {
        private readonly string _myAllowSpecificOrigins = "_myAllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<WitsmlClientCapabilities>(Configuration.GetSection("Witsml:ClientCapabilities"));
            string host = Configuration["Host"];
            if (string.IsNullOrEmpty(host) || !host.StartsWith("http"))
            {
                throw new Exception(
                    $"Invalid configuration. Missing or invalid value for 'Host': \"{host}\". Valid format is \"http[s]://domain\" Example: (\"http://localhost\")");
            }

            Log.Information($"Host: {host}");
            services.AddCors(options =>
                options.AddPolicy(_myAllowSpecificOrigins, builder =>
                    {
                        builder.WithOrigins($"{host}:3000");
                        builder.AllowAnyMethod();
                        builder.AllowAnyHeader();
                        builder.AllowCredentials();
                    }
                )
            );
            services.AddResponseCompression();
            services.AddSignalR();
            services.AddHttpContextAccessor();
            services.AddDataProtection();
            services.ConfigureDependencies(Configuration);
            services.AddHostedService<BackgroundWorkerService>();
            services.AddScoped<ICopyLogDataWorker, CopyLogDataWorker>();
            services.AddEndpointsApiExplorer();
            services.ConfigureSwaggerGen(Configuration);

            if (StringHelpers.ToBoolean(Configuration[ConfigConstants.OAuth2Enabled]))
            {
                services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));
                List<string> policyRoles = Configuration.GetSection("AzureAd:PolicyRoles").Get<List<string>>();
                foreach (string policyRole in policyRoles)
                {
                    services.AddAuthorization(options => options.AddPolicy(policyRole, authBuilder => authBuilder.RequireRole(policyRole)));
                }
            }

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.InitializeRepository();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.ConfigureSwagger(Configuration);
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseMiddleware<ExceptionMiddleware>();
            app.UseResponseCompression();
            app.UseCors(_myAllowSpecificOrigins);

            app.UseRouting();
            if (StringHelpers.ToBoolean(Configuration[ConfigConstants.OAuth2Enabled]))
            {
                app.UseAuthentication();
                app.UseAuthorization();

            }
            app.UseEndpoints(builder => builder.MapHub<NotificationsHub>("notifications"));
        }
    }
}
