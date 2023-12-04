using System;
using System.Collections.Generic;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace WitsmlExplorer.Api.Swagger
{
    public static class SwaggerGen
    {
        public static void ConfigureSwaggerGen(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSwaggerGen(options =>
                {
                    options.OperationFilter<WitsmlHeaderFilter>();
                    if (configuration["OAuth2Enabled"] == "True")
                    {
                        OpenApiSecurityScheme oAuth2Scheme = new()
                        {
                            In = ParameterLocation.Header,
                            Name = "Authorization",
                            Flows = new OpenApiOAuthFlows
                            {
                                AuthorizationCode = new OpenApiOAuthFlow
                                {
                                    AuthorizationUrl = new Uri(configuration["AzureAd:Swagger:AuthorizationUrl"]),
                                    TokenUrl = new Uri(configuration["AzureAd:Swagger:TokenUrl"])
                                }
                            },
                            Type = SecuritySchemeType.OAuth2
                        };
                        options.AddSecurityDefinition("OAuth2", oAuth2Scheme);
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
                    }
                }
            );
        }

        public static void ConfigureSwagger(this IApplicationBuilder app, IConfiguration configuration)
        {
            app.UseSwagger();
            if (configuration["OAuth2Enabled"] == "True")
            {
                app.UseSwaggerUI(
                    options =>
                    {
                        options.OAuthAppName(configuration["AzureAd:Swagger:AppName"]);
                        options.OAuthClientId(configuration["AzureAd:Swagger:ClientId"]);
                        options.OAuthScopes(configuration["AzureAd:Swagger:Scopes"]);
                        options.OAuthUsePkce();
                    }
                );
            }
            else
            {
                app.UseSwaggerUI();
            }
        }
    }
}
