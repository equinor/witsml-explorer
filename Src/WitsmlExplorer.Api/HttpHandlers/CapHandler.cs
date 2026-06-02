using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using Witsml.Data;
using Witsml.ETP;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class CapHandler
    {
        [Produces(typeof(WitsmlServerCapabilities))]
        public static async Task<IResult> GetCap(HttpContext httpContext, ICapService capService, IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await capService.GetCap());
        }

        [Produces(typeof(EtpServerCapabilities))]
        public static async Task<IResult> GetEtpCap(HttpContext httpContext, IEtpCapService etpCapService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            protocolCoordinator.SetEtpProtocolHeader(httpContext);
            return TypedResults.Ok(await etpCapService.GetCap(cancellationToken));
        }

        [Produces(typeof(IList<string>))]
        public static async Task<IResult> GetCapObjects(HttpContext httpContext, ICapService capService, IEtpCapService etpCapService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = eh.WitsmlProtocol == WitsmlProtocol.Auto ? WitsmlProtocol.Soap : eh.WitsmlProtocol;
            Task<IList<string>> SoapCall() => capService.GetCapObjects();
            Task<IList<string>> EtpCall() => etpCapService.GetCapObjects(cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
