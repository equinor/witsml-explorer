using System;
using System.Collections.Generic;
using System.Globalization;
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
        private readonly string _allowSpecificOrigin = "_allowSpecificOrigin";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<WitsmlClientCapabilities>(Configuration.GetSection("Witsml:ClientCapabilities"));
            string allowedOrigin = Configuration["AllowedOrigin"];
            if (string.IsNullOrEmpty(allowedOrigin) || !allowedOrigin.StartsWith("http"))
            {
                throw new Exception(
                    $"Invalid configuration. Missing or invalid value for 'AllowedOrigin': \"{allowedOrigin}\". Valid format is \"http[s]://domain\" Example: (\"http://localhost\")");
            }

            Log.Information($"AllowedOrigin: {allowedOrigin}");
            services.AddCors(options =>
                options.AddPolicy(_allowSpecificOrigin, builder =>
                    {
                        builder.WithOrigins(allowedOrigin);
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
                ConfigureAuth(services);
            }
        }

        private void ConfigureAuth(IServiceCollection services)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "MultiAuthScheme";
                options.DefaultChallengeScheme = "MultiAuthScheme";
            }).AddPolicyScheme("MultiAuthScheme", JwtBearerDefaults.AuthenticationScheme, options =>
            options.ForwardDefaultSelector = context =>
            {
                PathString path = context.Request.Path;
                if (path.StartsWithSegments("/notifications"))
                {
                    return "SignalRAuth";
                }
                return JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer("SignalRAuth", options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration[ConfigConstants.NotificationsKey])),
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
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            }
            ).AddMicrosoftIdentityWebApi(Configuration.GetSection("AzureAd"));

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

                AuthorizationPolicyBuilder signalRBuilder = new("SignalRAuth");
                options.AddPolicy("SignalRPolicy", signalRBuilder
                    .RequireAuthenticatedUser()
                    .Build());
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
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
            app.UseCors(_allowSpecificOrigin);

            app.UseRouting();
            bool oAuth2Enabled = StringHelpers.ToBoolean(Configuration[ConfigConstants.OAuth2Enabled]);
            if (oAuth2Enabled)
            {
                app.UseAuthentication();
                app.UseAuthorization();
            }
            app.UseMiddleware<UrlDecodeMiddleware>();
            app.UseMiddleware<LoggingMiddleware>();
            app.UseEndpoints(builder => builder.MapHub<NotificationsHub>("notifications", oAuth2Enabled, "SignalRPolicy"));
        }
    }
}
