using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Serilog.Context;

using WitsmlExplorer.Api.HttpHandlers;

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
            EssentialHeaders eh = new(context.Request);
            if (eh.TargetServer != null)
            {
                LogContext.PushProperty("WitsmlTarget", eh.TargetServer);
            }
            if (eh.SourceServer != null)
            {
                LogContext.PushProperty("WitsmlSource", eh.SourceServer);
            }

            await _next(context);
        }
    }
}
