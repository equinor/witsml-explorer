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
    public static class RiskHandler
    {
        [Produces(typeof(IEnumerable<Risk>))]
        public static async Task<IResult> GetRisks(HttpContext httpContext, string wellUid, string wellboreUid, IRiskService riskService, IEtpRiskService etpRiskService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<Risk>> SoapCall() => riskService.GetRisks(wellUid, wellboreUid);
            Task<ICollection<Risk>> EtpCall() => etpRiskService.GetRisks(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Risk))]
        public static async Task<IResult> GetRisk(HttpContext httpContext, string wellUid, string wellboreUid, string riskUid, IRiskService riskService, IEtpRiskService etpRiskService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Risk> SoapCall() => riskService.GetRisk(wellUid, wellboreUid, riskUid);
            Task<Risk> EtpCall() => etpRiskService.GetRisk(wellUid, wellboreUid, riskUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
