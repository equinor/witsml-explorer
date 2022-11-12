using System;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.HttpHandlers;
namespace WitsmlExplorer.Api.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetOrCreateWitsmlExplorerCookie(this HttpContext httpContext, string environment)
        {
            EssentialHeaders eh = new(httpContext.Request, environment);
            string cookieValue = eh.GetCookie();
            if (string.IsNullOrEmpty(cookieValue))
            {
                CookieOptions cookieOptions = new()
                {
                    SameSite = SameSiteMode.Strict,
                    Secure = true,
                    HttpOnly = true
                };
                cookieValue = Guid.NewGuid().ToString();
                httpContext?.Response.Cookies.Append($"{EssentialHeaders.CookieName}-{environment}", cookieValue, cookieOptions);
            }
            return cookieValue;
        }
    }
}
