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
    public static class TrajectoryHandler
    {
        [Produces(typeof(IEnumerable<Trajectory>))]
        public static async Task<IResult> GetTrajectories(HttpContext httpContext, string wellUid, string wellboreUid, ITrajectoryService trajectoryService, IEtpTrajectoryService etpTrajectoryService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<Trajectory>> SoapCall() => trajectoryService.GetTrajectories(wellUid, wellboreUid);
            Task<ICollection<Trajectory>> EtpCall() => etpTrajectoryService.GetTrajectories(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Trajectory))]
        public static async Task<IResult> GetTrajectory(HttpContext httpContext, string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService, IEtpTrajectoryService etpTrajectoryService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Trajectory> SoapCall() => trajectoryService.GetTrajectory(wellUid, wellboreUid, trajectoryUid);
            Task<Trajectory> EtpCall() => etpTrajectoryService.GetTrajectory(wellUid, wellboreUid, trajectoryUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(IEnumerable<TrajectoryStation>))]
        public static async Task<IResult> GetTrajectoryStations(HttpContext httpContext, string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService, IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await trajectoryService.GetTrajectoryStations(wellUid, wellboreUid, trajectoryUid));
        }
    }
}
