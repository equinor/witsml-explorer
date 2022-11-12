using System;
using System.Collections.Generic;
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
            string basicAuth = eh.GetHeaderValue(EssentialHeaders.WitsmlTargetServer);
            ServerCredentials creds = await credentialsService.GetCredentialsFromHeaderValue(basicAuth);
            await credentialsService.VerifyCredentials(creds);
            if (creds.IsCredsNullOrEmpty())
            {
                return Results.Unauthorized();
            }
            else
            {
                string cacheClientId = useOAuth2 ? credentialsService.GetClaimFromToken(eh, "sub") : Guid.NewGuid().ToString();
                if (!useOAuth2)
                {
                    CookieOptions cookieOptions = new() { SameSite = SameSiteMode.Strict, Secure = true, HttpOnly = true };
                    httpContext?.Response.Cookies.Append(EssentialHeaders.CookieName, cacheClientId, cookieOptions);
                }
                double ttl = keep ? 24.0 : 1.0; // hours
                credentialsService.CacheCredentials(cacheClientId, creds, ttl);
                return Results.Ok();
            }
        }
        public static IResult Deauthorize(IHttpContextAccessor httpContextAccessor)
        {
            foreach (KeyValuePair<string, string> cookie in httpContextAccessor.HttpContext.Request.Cookies)
            {
                httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie.Key);
                //@todo delete all keys
            }
            return Results.Ok();
        }
    }
}
