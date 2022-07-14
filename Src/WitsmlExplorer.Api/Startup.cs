// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
// See the LICENSE file in the project root for more information.

using System;
using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;
using Witsml.Data;

namespace WitsmlExplorer.Api
{
    public class Startup
    {
        readonly string myAllowSpecificOrigins = "_myAllowSpecificOrigins";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<WitsmlClientCapabilities>(Configuration.GetSection("Witsml:ClientCapabilities"));
            var host = Configuration["Host"];
            if (string.IsNullOrEmpty(host) || !host.StartsWith("http"))
            {
                throw new Exception(
                    $"Invalid configuration. Missing or invalid value for 'Host': \"{host}\". Valid format is \"http[s]://domain\" Example: (\"http://localhost\")");
            }

            Log.Information($"Host: {host}");
            services.AddCors(options =>
            {
                options.AddPolicy(myAllowSpecificOrigins, builder =>
                {
                    builder.WithOrigins($"{host}:3000");
                    builder.AllowAnyMethod();
                    builder.AllowAnyHeader();
                    builder.AllowCredentials();
                });
            });
            services.AddResponseCompression();
            services.AddCarter();
            services.AddSignalR();
            services.AddHttpContextAccessor();
            services.AddDataProtection();
            services.ConfigureDependencies(Configuration);
            services.AddHostedService<BackgroundWorkerService>();
            services.AddScoped<ICopyLogDataWorker, CopyLogDataWorker>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.InitializeRepository();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseMiddleware<ExceptionMiddleware>();
            }
            else
            {
                app.UseMiddleware<ExceptionMiddleware>();
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseResponseCompression();
            app.UseCors(myAllowSpecificOrigins);

            app.UseStaticFiles();

            app.UseRouting();
            app.UseEndpoints(builder =>
            {
                builder.MapCarter();
                builder.MapHub<NotificationsHub>("notifications");
            });
        }
    }
}
