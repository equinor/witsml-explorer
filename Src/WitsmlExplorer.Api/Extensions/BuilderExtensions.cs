using System;

using Azure.Identity;

using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Extensions
{
    public static class BuilderExtensions
    {

        public static IConfigurationBuilder AddAzureWitsmlServerCreds(this ConfigurationManager configuration)
        {
            string keyVault = configuration[ConfigConstants.KVWitsmlServerCreds];
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            if (useOAuth2)
            {
                configuration.AddAzureKeyVault(new Uri($"https://{keyVault}.vault.azure.net/"), new DefaultAzureCredential());
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
