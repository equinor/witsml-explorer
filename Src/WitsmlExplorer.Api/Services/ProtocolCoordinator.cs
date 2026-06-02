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
            if (requestedProtocol == WitsmlProtocol.Etp)
            {
                try
                {
                    T etpResult = await etpCall();
                    SetProtocolHeader(httpContext, WitsmlProtocol.Etp);
                    return TypedResults.Ok(etpResult);
                }
                catch (EtpEndpointNotConfiguredException)
                {
                    // Fallback to SOAP only when ETP endpoint is not configured for the target server.
                    _logger.LogDebug("ETP endpoint not configured for target server. Falling back to SOAP.");
                }
            }

            T soapResult = await soapCall();
            SetProtocolHeader(httpContext, WitsmlProtocol.Soap);
            return TypedResults.Ok(soapResult);
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
