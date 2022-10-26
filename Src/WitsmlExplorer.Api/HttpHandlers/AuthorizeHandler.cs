using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromQuery(Name = "keep")] bool keep, [FromServices] ICredentialsService credentialsService, HttpContext httpContext)
        {
            string basicAuth = httpContext?.Request.Headers[WitsmlClientProvider.WitsmlTargetServerHeader].ToString();
            ServerCredentials creds = await credentialsService.GetCredentialsFromHeaderValue(basicAuth);

            if (creds.IsCredsNullOrEmpty())
            {
                return Results.Unauthorized();
            }
            else
            {
                string encryptedCredentials = await credentialsService.ProtectBasicAuthorization(basicAuth);
                CookieOptions cookieOptions = new()
                {
                    SameSite = SameSiteMode.Strict,
                    MaxAge = keep ? TimeSpan.FromDays(1) : null,
                    Secure = true,
                    HttpOnly = true
                };
                httpContext?.Response.Cookies.Append(Uri.EscapeDataString(creds.Host.ToString()), encryptedCredentials, cookieOptions);
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
