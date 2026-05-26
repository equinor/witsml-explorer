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
    public static class FormationMarkerHandler
    {
        [Produces(typeof(IEnumerable<FormationMarker>))]
        public static async Task<IResult> GetFormationMarkers(HttpContext httpContext, string wellUid, string wellboreUid, IFormationMarkerService formationMarkerService, IEtpFormationMarkerService etpFormationMarkerService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<FormationMarker>> SoapCall() => formationMarkerService.GetFormationMarkers(wellUid, wellboreUid);
            Task<ICollection<FormationMarker>> EtpCall() => etpFormationMarkerService.GetFormationMarkers(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);

        }
        [Produces(typeof(FormationMarker))]
        public static async Task<IResult> GetFormationMarker(HttpContext httpContext, string wellUid, string wellboreUid, string formationMarkerUid, IFormationMarkerService formationMarkerService, IEtpFormationMarkerService etpFormationMarkerService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<FormationMarker> SoapCall() => formationMarkerService.GetFormationMarker(wellUid, wellboreUid, formationMarkerUid);
            Task<FormationMarker> EtpCall() => etpFormationMarkerService.GetFormationMarker(wellUid, wellboreUid, formationMarkerUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
