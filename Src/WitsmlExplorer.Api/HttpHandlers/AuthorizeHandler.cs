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
        public static async Task<IResult> Authorize([FromQuery(Name = "keep")] bool keep, [FromServices] ICredentialsService credentialsService, HttpContext httpContext)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            bool success = await credentialsService.VerifyAndCacheCredentials(eh, keep, httpContext);
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
            if (!useOAuth2)
            {
                httpContext.Response.Cookies.Delete(EssentialHeaders.CookieName);
            }
            string cacheId = credentialsService.GetCacheId(eh);
            credentialsService.RemoveCachedCredentials(cacheId);

            return TypedResults.Ok();
        }
    }
}
