using System;
using System.Collections.Generic;
using System.Runtime.Caching;
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
        public static async Task<IResult> Authorize([FromQuery(Name = "keep")] bool keep, [FromServices] ICredentialsService credentialsService, IConfiguration configuration, ICredentialsCache credentialsCache, HttpContext httpContext)
        {
            bool useOAuth2 = StringHelpers.ToBoolean(configuration[ConfigConstants.OAuth2Enabled]);
            EssentialHeaders eh = new(httpContext?.Request);
            string basicAuth = eh.GetHeaderValue(EssentialHeaders.WitsmlTargetServer);
            ServerCredentials creds = await credentialsService.GetCredentialsFromHeaderValue(basicAuth);

            if (creds.IsCredsNullOrEmpty())
            {
                return Results.Unauthorized();
            }
            else
            {
                string guid = useOAuth2 ? credentialsService.GetClaimFromToken(eh, "sub") : Guid.NewGuid().ToString();
                CacheItemPolicy cachePolicy = keep ?
                    new CacheItemPolicy() { AbsoluteExpiration = DateTimeOffset.Now.AddHours(24.0) } :
                    new CacheItemPolicy() { AbsoluteExpiration = DateTimeOffset.Now.AddHours(1.0) };
                string encryptedCredentials = await credentialsService.ProtectBasicAuthorization(basicAuth);
                CookieOptions cookieOptions = new()
                {
                    SameSite = SameSiteMode.Strict,
                    MaxAge = keep ? TimeSpan.FromDays(1) : TimeSpan.FromHours(1),
                    Secure = true,
                    HttpOnly = true
                };
                httpContext?.Response.Cookies.Append(Uri.EscapeDataString(creds.Host.ToString()), encryptedCredentials, cookieOptions);
                credentialsCache.Set(guid, encryptedCredentials, cachePolicy);
                return Results.Ok();
            }
        }
        public static IResult Deauthorize(IHttpContextAccessor httpContextAccessor)
        {
            foreach (KeyValuePair<string, string> cookie in httpContextAccessor.HttpContext.Request.Cookies)
            {
                httpContextAccessor.HttpContext.Response.Cookies.Delete(cookie.Key);
            }
            return Results.Ok();
        }
    }
}
