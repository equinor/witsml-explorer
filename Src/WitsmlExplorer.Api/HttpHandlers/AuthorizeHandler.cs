using System;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class AuthorizeHandler
    {
        public static async Task<IResult> Authorize([FromServices] ICredentialsService credentialsService, HttpRequest httpRequest)
        {
            string basicAuth = httpRequest.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            return Results.Ok(await credentialsService.ProtectBasicAuthorization(basicAuth));
        }

        public static async Task<IResult> AuthorizeAndSetCookie([FromServices] ICredentialsService credentialsService, IHttpContextAccessor httpContextAccessor)
        {
            string basicAuth = httpContextAccessor?.HttpContext?.Request.Headers[WitsmlClientProvider.WitsmlTargetServerHeader];
            ServerCredentials creds = await credentialsService.GetCredentialsFromHeaderValue(basicAuth);
            string encryptedPassword = await credentialsService.ProtectBasicAuthorization(basicAuth);

            CookieOptions cookieOptions = new()
            {
                SameSite = SameSiteMode.None,
                MaxAge = TimeSpan.FromDays(1),
                Secure = false,
                HttpOnly = true
            };
            string cookieValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{creds.UserId}:{encryptedPassword}"));
            httpContextAccessor.HttpContext.Response.Cookies.Append(Uri.EscapeDataString(creds.Host.ToString()), cookieValue, cookieOptions);
            return Results.Ok(encryptedPassword);
        }

        public static IResult AuthorizeWithCookie([FromServices] ICredentialsService credentialsService, IHttpContextAccessor httpContextAccessor)
        {
            ServerCredentials targetServer = httpContextAccessor?.HttpContext?.Request.GetWitsmlServerHttpHeader(WitsmlClientProvider.WitsmlTargetServerHeader, n => "");
            IRequestCookieCollection cookies = httpContextAccessor.HttpContext.Request.Cookies;
            if (targetServer.Host == null || !cookies.TryGetValue(Uri.EscapeDataString(targetServer.Host.ToString()), out string cookie))
            {
                return Results.Unauthorized();
            }
            if (!credentialsService.ValidEncryptedBasicCredentials($"{cookie}@{targetServer.Host}"))
            {
                return Results.Unauthorized();
            }
            return Results.Ok(cookie);
        }
    }
}
