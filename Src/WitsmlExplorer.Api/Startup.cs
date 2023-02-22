using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Primitives;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;

using Serilog;

using Witsml.Data;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
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
                //this one is used on notifications route as well causing validation error spam
                services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));
                services.AddAuthentication().AddJwtBearer("SignalR", options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = "https://localhost:5000/",
                        ValidAudience = "https://localhost:5000/",
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("superSecretKey@1")),
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            EssentialHeaders eh = new(context.Request);
                            StringValues accessToken = context.Request.Query["access_token"];
                            PathString path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notifications"))
                            {
                                // Read the token out of the query string
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                }
                );

                services.AddAuthorization(options =>
                {
                    List<string> policyRoles = Configuration.GetSection("AzureAd:PolicyRoles").Get<List<string>>();
                    foreach (string policyRole in policyRoles)
                    {
                        options.AddPolicy(policyRole, authBuilder => authBuilder.RequireRole(policyRole));
                    }
                    options.AddPolicy(AuthorizationPolicyRoles.ADMINORDEVELOPER, authBuilder =>
                        authBuilder.RequireRole(new string[] { AuthorizationPolicyRoles.ADMIN, AuthorizationPolicyRoles.DEVELOPER })
                    );

                    AuthorizationPolicyBuilder signalRBuilder = new("SignalR");
                    options.AddPolicy("SignalRPolicy", signalRBuilder
                        .RequireAuthenticatedUser()
                        .Build());
                });
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
            app.UseMiddleware<LoggingMiddleware>();
            app.UseEndpoints(builder => builder.MapHub<NotificationsHub>("notifications").RequireAuthorization("SignalRPolicy"));
        }
    }
}
