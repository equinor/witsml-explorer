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
    public static class WbGeometryHandler
    {
        [Produces(typeof(IEnumerable<WbGeometry>))]
        public static async Task<IResult> GetWbGeometries(HttpContext httpContext, string wellUid, string wellboreUid, IWbGeometryService wbGeometryService, IEtpWbGeometryService etpWbGeometryService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<WbGeometry>> SoapCall() => wbGeometryService.GetWbGeometrys(wellUid, wellboreUid);
            Task<ICollection<WbGeometry>> EtpCall() => etpWbGeometryService.GetWbGeometrys(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(WbGeometry))]
        public static async Task<IResult> GetWbGeometry(HttpContext httpContext, string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService, IEtpWbGeometryService etpWbGeometryService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<WbGeometry> SoapCall() => wbGeometryService.GetWbGeometry(wellUid, wellboreUid, wbGeometryUid);
            Task<WbGeometry> EtpCall() => etpWbGeometryService.GetWbGeometry(wellUid, wellboreUid, wbGeometryUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(IEnumerable<WbGeometrySection>))]
        public static async Task<IResult> GetWbGeometrySections(HttpContext httpContext, string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService, IEtpWbGeometryService etpWbGeometryService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<List<WbGeometrySection>> SoapCall() => wbGeometryService.GetWbGeometrySections(wellUid, wellboreUid, wbGeometryUid);
            Task<List<WbGeometrySection>> EtpCall() => etpWbGeometryService.GetWbGeometrySections(wellUid, wellboreUid, wbGeometryUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
