using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Serilog.Context;

namespace WitsmlExplorer.Api.Middleware
{

    /// <summary>
    /// Needs be registered as middleware after registering authentication middleware
    /// </summary>
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        public LoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity is { IsAuthenticated: true })
            {
                string username = context.User.Identity?.Name;
                LogContext.PushProperty("Username", username);
            }

            await _next(context);
        }
    }
}
