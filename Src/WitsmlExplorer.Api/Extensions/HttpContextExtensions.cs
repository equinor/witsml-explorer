using System.Security.Cryptography;

using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

using WitsmlExplorer.Api.HttpHandlers;

namespace WitsmlExplorer.Api.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetOrCreateWitsmlExplorerCookie(this HttpContext httpContext)
        {
            EssentialHeaders eh = new(httpContext.Request);
            string cookieValue = eh.GetCookieValue();
            if (string.IsNullOrEmpty(cookieValue))
            {
                CookieOptions cookieOptions = new()
                {
                    SameSite = SameSiteMode.Strict,
                    Secure = true,
                    HttpOnly = true
                };
                // Using a more secure ID than Guid https://neilmadden.blog/2018/08/30/moving-away-from-uuids/
                cookieValue = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(20));
                httpContext?.Response.Cookies.Append(EssentialHeaders.CookieName, cookieValue, cookieOptions);
            }
            return cookieValue;
        }
    }
}
