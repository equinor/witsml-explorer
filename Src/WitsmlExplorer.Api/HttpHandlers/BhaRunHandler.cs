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
    public static class BhaRunHandler
    {
        [Produces(typeof(IEnumerable<BhaRun>))]
        public static async Task<IResult> GetBhaRuns(HttpContext httpContext, string wellUid, string wellboreUid, IBhaRunService bhaRunService, IEtpBhaRunService etpBhaRunService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<BhaRun>> SoapCall() => bhaRunService.GetBhaRuns(wellUid, wellboreUid);
            Task<ICollection<BhaRun>> EtpCall() => etpBhaRunService.GetBhaRuns(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
        [Produces(typeof(BhaRun))]
        public static async Task<IResult> GetBhaRun(HttpContext httpContext, string wellUid, string wellboreUid, string bhaRunUid, IBhaRunService bhaRunService, IEtpBhaRunService etpBhaRunService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<BhaRun> SoapCall() => bhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid);
            Task<BhaRun> EtpCall() => etpBhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
