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
    public static class FluidsReportHandler
    {
        [Produces(typeof(IEnumerable<FluidsReport>))]
        public static async Task<IResult> GetFluidsReports(HttpContext httpContext, string wellUid, string wellboreUid, IFluidsReportService fluidsReportService, IEtpFluidsReportService etpFluidsReportService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<FluidsReport>> SoapCall() => fluidsReportService.GetFluidsReports(wellUid, wellboreUid);
            Task<ICollection<FluidsReport>> EtpCall() => etpFluidsReportService.GetFluidsReports(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(FluidsReport))]
        public static async Task<IResult> GetFluidsReport(HttpContext httpContext, string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService, IEtpFluidsReportService etpFluidsReportService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<FluidsReport> SoapCall() => fluidsReportService.GetFluidsReport(wellUid, wellboreUid, fluidsReportUid);
            Task<FluidsReport> EtpCall() => etpFluidsReportService.GetFluidsReport(wellUid, wellboreUid, fluidsReportUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(List<Fluid>))]
        public static async Task<IResult> GetFluids(HttpContext httpContext, string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService, IEtpFluidsReportService etpFluidsReportService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<List<Fluid>> SoapCall() => fluidsReportService.GetFluids(wellUid, wellboreUid, fluidsReportUid);
            Task<List<Fluid>> EtpCall() => etpFluidsReportService.GetFluids(wellUid, wellboreUid, fluidsReportUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
