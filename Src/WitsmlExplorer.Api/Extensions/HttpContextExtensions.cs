using System.Security.Cryptography;

using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Extensions
{
    public static class HttpContextExtensions
    {
        public static string CreateWitsmlExplorerCookie(this HttpContext httpContext, bool isDesktopApp)
        {
            CookieOptions cookieOptions = new()
            {
                SameSite = isDesktopApp ? SameSiteMode.None : SameSiteMode.Strict,
                Secure = true,
                HttpOnly = true
            };
            // Using a more secure ID than Guid https://neilmadden.blog/2018/08/30/moving-away-from-uuids/
            string cookieValue = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(20));
            httpContext?.Response.Cookies.Append(EssentialHeaders.CookieName, cookieValue, cookieOptions);
            return cookieValue;
        }
    }
}
