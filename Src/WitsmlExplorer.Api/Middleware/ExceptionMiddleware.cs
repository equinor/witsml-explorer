using System;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Security;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Serilog;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Middleware
{
    // Source: https://code-maze.com/global-error-handling-aspnetcore/
    // ReSharper disable once ClassNeverInstantiated.Global
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ErrorDetails _errorDetails500 = new() { StatusCode = (int)HttpStatusCode.InternalServerError, Message = "Something unexpected has happened." };
        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (MessageSecurityException ex)
            {
                Log.Debug($"Not valid credentials: {ex}");
                ErrorDetails errorDetails = new()
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    Message = "Not able to authenticate to WITSML server with given credentials"
                };
                await HandleExceptionAsync(httpContext, errorDetails);
            }
            catch (EndpointNotFoundException ex)
            {
                Log.Debug($"Not able to connect server endpoint. : {ex}");
                ServerCredentials witsmlTarget = httpContext.Request.GetWitsmlServerHttpHeader(EssentialHeaders.WitsmlTargetServer, n => "");
                ErrorDetails errorDetails = new()
                {
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Message = $"Not able to connect to server endpoint: \"{witsmlTarget.Host}\""
                };
                await HandleExceptionAsync(httpContext, errorDetails);
            }
            catch (RepositoryException ex)
            {
                Log.Error($"Got status code: {ex.StatusCode} and message: {ex.Message}");
                await HandleExceptionAsync(httpContext, _errorDetails500);
            }
            catch (WitsmlClientProviderException ex)
            {
                Log.Information($"Got status code: {ex.StatusCode}, for server: {ex.Server} and message: {ex.Message}");
                WitsmlClientProviderExceptionDetails errorDetails = new() { StatusCode = ex.StatusCode, Message = ex.Message, Server = ex.Server };
                await HandleExceptionAsync(httpContext, errorDetails);
            }
            catch (WitsmlResultParsingException ex)
            {
                Log.Error($"Got status code: {ex.StatusCode} and message: {ex.Message}");
                await HandleExceptionAsync(httpContext, new() { StatusCode = ex.StatusCode, Message = ex.Message });
            }
            catch (Exception ex)
            {
                Log.Fatal($"Something went wrong: {ex}");
                await HandleExceptionAsync(httpContext, _errorDetails500);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, ErrorDetails errorDetails)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = errorDetails.StatusCode;

            return context.Response.WriteAsync(errorDetails.ToString());
        }
    }
}
