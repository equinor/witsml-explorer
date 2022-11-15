using System;

using Microsoft.AspNetCore.Http;

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
                cookieValue = Guid.NewGuid().ToString();
                httpContext?.Response.Cookies.Append(EssentialHeaders.CookieName, cookieValue, cookieOptions);
            }
            return cookieValue;
        }
    }
}
