using System;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Security;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using Serilog;

using Witsml;

using WitsmlExplorer.Api.Configuration;
using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Repositories;

namespace WitsmlExplorer.Api.Middleware
{
    // Source: https://code-maze.com/global-error-handling-aspnetcore/
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
            catch (TimeoutException ex)
            {
                Log.Error($"Connection failed, timeout occured: {ex}");
                ErrorDetails errorDetails = new()
                {
                    StatusCode = (int)HttpStatusCode.GatewayTimeout,
                    Message = "Connection to server failed, no response in timeout"
                };
                await HandleExceptionAsync(httpContext, errorDetails);
            }
            catch (ProtocolException ex)
            {
                Log.Error($"Invalid response from server: {ex}");
                ErrorDetails errorDetails = new()
                {
                    StatusCode = (int)HttpStatusCode.BadGateway,
                    Message = "Remote endpoint did not send WITSML server response"
                };
                await HandleExceptionAsync(httpContext, errorDetails);
            }
            catch (WitsmlRemoteServerRequestCrashedException ex)
            {
                Log.Error($"Invalid response from server: {ex}");
                ErrorDetails errorDetails = new()
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = "WITSML remote request failed on the server."
                };
                await HandleExceptionAsync(httpContext, errorDetails);
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
                ServerCredentials witsmlTarget = httpContext.Request.GetWitsmlServerHttpHeader(EssentialHeaders.WitsmlAuthHeader, _ => string.Empty);
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
            catch (WitsmlUnsupportedCapabilityException ex)
            {
                Log.Error($"Got status code: {ex.StatusCode} and message: {ex.Message}");
                await HandleExceptionAsync(httpContext, new() { StatusCode = ex.StatusCode, Message = ex.Message });
            }
            catch (DataException ex)
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
            context.Response.ContentType = System.Net.Mime.MediaTypeNames.Application.Json;
            context.Response.StatusCode = errorDetails.StatusCode;

            return context.Response.WriteAsync(errorDetails.ToString());
        }
    }
}
