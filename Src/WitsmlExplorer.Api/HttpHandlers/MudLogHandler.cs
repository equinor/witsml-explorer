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
    public static class MudLogHandler
    {
        [Produces(typeof(IEnumerable<MudLog>))]
        public static async Task<IResult> GetMudLogs(HttpContext httpContext, string wellUid, string wellboreUid, IMudLogService mudLogService, IEtpMudLogService etpMudLogService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<MudLog>> SoapCall() => mudLogService.GetMudLogs(wellUid, wellboreUid);
            Task<ICollection<MudLog>> EtpCall() => etpMudLogService.GetMudLogs(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(MudLog))]
        public static async Task<IResult> GetMudLog(HttpContext httpContext, string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService, IEtpMudLogService etpMudLogService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<MudLog> SoapCall() => mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid);
            Task<MudLog> EtpCall() => etpMudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(List<MudLogGeologyInterval>))]
        public static async Task<IResult> GetGeologyIntervals(HttpContext httpContext, string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService, IEtpMudLogService etpMudLogService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<List<MudLogGeologyInterval>> SoapCall() => mudLogService.GetGeologyIntervals(wellUid, wellboreUid, mudlogUid);
            Task<List<MudLogGeologyInterval>> EtpCall() => etpMudLogService.GetGeologyIntervals(wellUid, wellboreUid, mudlogUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
