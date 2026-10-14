using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.HttpHandlers;
using WitsmlExplorer.Api.Middleware;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface IProtocolCoordinator
    {
        Task<IResult> ExecuteOkAsync<T>(HttpContext httpContext, WitsmlProtocol requestedProtocol, Func<Task<T>> soapCall, Func<Task<T>> etpCall);
        Task<T> ExecuteAsync<T>(WitsmlProtocol requestedProtocol, Func<Task<T>> soapCall, Func<Task<T>> etpCall);
        Task ExecuteAsync(WitsmlProtocol requestedProtocol, Func<Task> soapCall, Func<Task> etpCall);
        void SetProtocolHeader(HttpContext httpContext, WitsmlProtocol protocol);
        void SetSoapProtocolHeader(HttpContext httpContext);
        void SetEtpProtocolHeader(HttpContext httpContext);
    }

    public class ProtocolCoordinator : IProtocolCoordinator
    {
        private readonly ILogger<ProtocolCoordinator> _logger;

        public ProtocolCoordinator(ILogger<ProtocolCoordinator> logger)
        {
            _logger = logger;
        }

        public async Task<IResult> ExecuteOkAsync<T>(HttpContext httpContext, WitsmlProtocol requestedProtocol, Func<Task<T>> soapCall, Func<Task<T>> etpCall)
        {
            var (result, usedProtocol) = await ExecuteProtocolAsync(requestedProtocol, soapCall, etpCall);
            SetProtocolHeader(httpContext, usedProtocol);
            return TypedResults.Ok(result);
        }

        public async Task<T> ExecuteAsync<T>(WitsmlProtocol requestedProtocol, Func<Task<T>> soapCall, Func<Task<T>> etpCall)
        {
            var (result, _) = await ExecuteProtocolAsync(requestedProtocol, soapCall, etpCall);
            return result;
        }

        public Task ExecuteAsync(WitsmlProtocol requestedProtocol, Func<Task> soapCall, Func<Task> etpCall)
        {
            return ExecuteAsync<bool>(
                requestedProtocol,
                async () => { await soapCall(); return true; },
                async () => { await etpCall(); return true; });
        }

        private async Task<(T Result, WitsmlProtocol UsedProtocol)> ExecuteProtocolAsync<T>(WitsmlProtocol requestedProtocol, Func<Task<T>> soapCall, Func<Task<T>> etpCall)
        {
            if (requestedProtocol == WitsmlProtocol.Etp)
            {
                try
                {
                    var result = await etpCall();
                    return (result, WitsmlProtocol.Etp);
                }
                catch (EtpEndpointNotConfiguredException)
                {
                    // Fallback to SOAP only when ETP endpoint is not configured for the target server. Other errors will propagate to the caller.
                    _logger.LogDebug("ETP endpoint not configured for target server. Falling back to SOAP.");
                }
            }

            var soapResult = await soapCall();
            return (soapResult, WitsmlProtocol.Soap);
        }

        public void SetProtocolHeader(HttpContext httpContext, WitsmlProtocol protocol)
        {
            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = protocol.ToString();
        }

        public void SetSoapProtocolHeader(HttpContext httpContext)
        {
            SetProtocolHeader(httpContext, WitsmlProtocol.Soap);
        }

        public void SetEtpProtocolHeader(HttpContext httpContext)
        {
            SetProtocolHeader(httpContext, WitsmlProtocol.Etp);
        }
    }
}
