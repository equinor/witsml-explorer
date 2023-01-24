using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromQuery(Name = "keep")] bool keep, [FromServices] ICredentialsService credentialsService, IConfiguration configuration, HttpContext httpContext)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            EssentialHeaders eh = new(httpContext?.Request);
            bool success = await credentialsService.VerifyAndCacheCredentials(eh, useOAuth2, keep);
            if (success)
            {
                return TypedResults.Ok();
            }
            return TypedResults.Unauthorized();
        }

        public static IResult Deauthorize(IConfiguration configuration, HttpContext httpContext, [FromServices] ICredentialsService credentialsService)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            EssentialHeaders eh = new(httpContext?.Request);
            string cacheClientId = useOAuth2 ? credentialsService.GetClaimFromToken(eh.GetBearerToken(), "sub") : eh.GetCookieValue();
            if (!useOAuth2)
            {
                httpContext.Response.Cookies.Delete(EssentialHeaders.CookieName);
            }
            credentialsService.RemoveCachedCredentials(cacheClientId);

            return TypedResults.Ok();
        }
    }
}
