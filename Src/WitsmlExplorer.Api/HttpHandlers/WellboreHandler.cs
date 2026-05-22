using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WellboreHandler
    {
        [Produces(typeof(IEnumerable<Wellbore>))]
        public static async Task<IResult> GetWellbores(HttpContext httpContext, string wellUid, IWellboreService wellboreService, IEtpWellboreService etpWellboreService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap; // Remove last condition if we find a reliable way to get all wellbores for all wells that works on all servers via ETP.
            Task<IList<Wellbore>> SoapCall() => wellboreService.GetWellbores(wellUid ?? "");
            Task<IList<Wellbore>> EtpCall() => etpWellboreService.GetWellbores(wellUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellbore(HttpContext httpContext, string wellUid, string wellboreUid, IWellboreService wellboreService, IEtpWellboreService etpWellboreService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap; // Remove last conditions if we find a reliable way to get wellbore by uid for all servers via ETP.
            Task<Wellbore> SoapCall() => wellboreService.GetWellbore(wellUid, wellboreUid);
            Task<Wellbore> EtpCall() => etpWellboreService.GetWellbore(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellboreByName(HttpContext httpContext, string wellboreName, IWellboreService wellboreService, IProtocolCoordinator protocolCoordinator)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by name for all servers is found.
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await wellboreService.GetWellboreByName(wellboreName));
        }
    }
}
