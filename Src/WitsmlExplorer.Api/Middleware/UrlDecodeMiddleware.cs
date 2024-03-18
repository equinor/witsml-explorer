using System;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;

public class UrlDecodeMiddleware
{
    private readonly RequestDelegate _next;

    public UrlDecodeMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        foreach (var key in context.Request.RouteValues.Keys)
        {
            if (context.Request.RouteValues.TryGetValue(key, out var value) && value is string stringValue)
            {
                try
                {
                    context.Request.RouteValues[key] = HttpUtility.UrlDecode(stringValue);
                }
                catch (Exception e)
                {
                    throw new Exception($"Was not able to decode route value: {stringValue}: {e.Message}");
                }
            }
        }

        await _next(context);
    }
}
