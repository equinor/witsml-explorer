using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

using Serilog;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Workers;

namespace WitsmlExplorer.Api
{
    public class Startup
    {
        readonly string _myAllowSpecificOrigins = "_myAllowSpecificOrigins";

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
            services.AddSwaggerGen(options =>
            {
                var basicSecurityScheme = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "Basic",
                    Reference = new OpenApiReference { Id = "BasicAuth", Type = ReferenceType.SecurityScheme }
                };
                options.AddSecurityDefinition(basicSecurityScheme.Reference.Id, basicSecurityScheme);
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {basicSecurityScheme, Array.Empty<string>()}
                });
                var oAuth2scheme = new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Name = "Authorization",
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri(Configuration["AzureAd:Swagger:AuthorizationUrl"]),
                            TokenUrl = new Uri(Configuration["AzureAd:Swagger:TokenUrl"])
                        }
                    },
                    Type = SecuritySchemeType.OAuth2
                };
                options.AddSecurityDefinition("OAuth2", oAuth2scheme);
                options.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Id = "OAuth2", Type = ReferenceType.SecurityScheme },
                            Type = SecuritySchemeType.OAuth2,
                        },
                        new List<string> { }
                    }
                });
            });
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));
            services.AddAuthorization(options => options.AddPolicy("Policy_Access", authBuilder => authBuilder.RequireRole("app-role-A")));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.InitializeRepository();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(
                    options =>
                    {
                        options.OAuthAppName(Configuration["AzureAd:AppName"]);
                        options.OAuthClientId(Configuration["AzureAd:ClientId"]);
                        options.OAuthScopes(Configuration["AzureAd:Scopes"]);
                        options.OAuthUsePkce();
                    }
                );
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
            //app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(builder => builder.MapHub<NotificationsHub>("notifications"));
        }
    }
}
