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
    public static class RigHandler
    {
        [Produces(typeof(IEnumerable<Rig>))]
        public static async Task<IResult> GetRigs(HttpContext httpContext, string wellUid, string wellboreUid, IRigService rigService, IEtpRigService etpRigService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<Rig>> SoapCall() => rigService.GetRigs(wellUid, wellboreUid);
            Task<ICollection<Rig>> EtpCall() => etpRigService.GetRigs(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
        [Produces(typeof(Rig))]
        public static async Task<IResult> GetRig(HttpContext httpContext, string wellUid, string wellboreUid, string rigUid, IRigService rigService, IEtpRigService etpRigService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Rig> SoapCall() => rigService.GetRig(wellUid, wellboreUid, rigUid);
            Task<Rig> EtpCall() => etpRigService.GetRig(wellUid, wellboreUid, rigUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
