using System;

using Azure.Identity;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Extensions
{
    public static class BuilderExtensions
    {
        public static TBuilder SetupAuthorization<TBuilder>(this TBuilder builder, bool oAuth2Enabled) where TBuilder : IEndpointConventionBuilder
        {
            if (oAuth2Enabled)
            {
                builder.RequireAuthorization();
            }
            return builder;
        }

        public static TBuilder SetupAuthorization<TBuilder>(this TBuilder builder, bool oAuth2Enabled, params string[] policyNames) where TBuilder : IEndpointConventionBuilder
        {
            if (oAuth2Enabled)
            {
                builder.RequireAuthorization(policyNames);
            }
            return builder;
        }

        public static IConfigurationBuilder AddAzureWitsmlServerCreds(this IConfigurationBuilder configuration, string keyVaultName, bool oAuth2Enabled)
        {

            if (oAuth2Enabled)
            {
                configuration.AddAzureKeyVault(new Uri($"https://{keyVaultName}.vault.azure.net/"), new DefaultAzureCredential(
                                    new DefaultAzureCredentialOptions
                                    {
                                        ExcludeVisualStudioCredential = true,
                                        ExcludeVisualStudioCodeCredential = true
                                    }));
            }
            return configuration;
        }

    }
    public static class AuthorizationPolicyRoles
    {
        public const string ADMIN = "admin";
        public const string DEVELOPER = "developer";
    }
}
