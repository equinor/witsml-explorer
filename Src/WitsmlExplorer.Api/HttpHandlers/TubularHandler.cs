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
    public static class TubularHandler
    {
        [Produces(typeof(IEnumerable<Tubular>))]
        public static async Task<IResult> GetTubulars(HttpContext httpContext, string wellUid, string wellboreUid, ITubularService tubularService, IEtpTubularService etpTubularService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<Tubular>> SoapCall() => tubularService.GetTubulars(wellUid, wellboreUid);
            Task<ICollection<Tubular>> EtpCall() => etpTubularService.GetTubulars(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Tubular))]
        public static async Task<IResult> GetTubular(HttpContext httpContext, string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService, IEtpTubularService etpTubularService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Tubular> SoapCall() => tubularService.GetTubular(wellUid, wellboreUid, tubularUid);
            Task<Tubular> EtpCall() => etpTubularService.GetTubular(wellUid, wellboreUid, tubularUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(IEnumerable<TubularComponent>))]
        public static async Task<IResult> GetTubularComponents(HttpContext httpContext, string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService, IEtpTubularService etpTubularService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<TubularComponent>> SoapCall() => tubularService.GetTubularComponents(wellUid, wellboreUid, tubularUid);
            Task<ICollection<TubularComponent>> EtpCall() => etpTubularService.GetTubularComponents(wellUid, wellboreUid, tubularUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
