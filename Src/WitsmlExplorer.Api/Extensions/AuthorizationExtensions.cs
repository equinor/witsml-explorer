using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace WitsmlExplorer.Api.Extensions
{
    public static class AuthorizationExtensions
    {
        public static TBuilder SetupAuthorization<TBuilder>(this TBuilder builder, IConfiguration configuration) where TBuilder : IEndpointConventionBuilder
        {
            if (configuration["OAuth2Enabled"] == "True")
            {
                builder.RequireAuthorization();
            }
            return builder;
        }

        public static TBuilder SetupAuthorization<TBuilder>(this TBuilder builder, IConfiguration configuration, params string[] policyNames) where TBuilder : IEndpointConventionBuilder
        {
            if (configuration["OAuth2Enabled"] == "True")
            {
                builder.RequireAuthorization(policyNames);
            }
            return builder;
        }
    }
    public static class AuthorizationPolicyRoles
    {
        public const string ADMIN = "admin";
        public const string DEVELOPER = "developer";
    }
}
