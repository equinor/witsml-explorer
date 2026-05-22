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
    public static class WellHandler
    {
        [Produces(typeof(IEnumerable<Well>))]
        public static async Task<IResult> GetAllWells(HttpContext httpContext, IWellService wellService, IEtpWellService etpWellService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = eh.WitsmlProtocol == WitsmlProtocol.Auto ? WitsmlProtocol.Soap : eh.WitsmlProtocol;
            Task<IList<Well>> SoapCall() => wellService.GetWells();
            Task<IList<Well>> EtpCall() => etpWellService.GetWells(cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Well))]
        public static async Task<IResult> GetWell(HttpContext httpContext, string wellUid, IWellService wellService, IEtpWellService etpWellService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = eh.WitsmlProtocol == WitsmlProtocol.Auto ? WitsmlProtocol.Soap : eh.WitsmlProtocol;
            Task<Well> SoapCall() => wellService.GetWell(wellUid);
            Task<Well> EtpCall() => etpWellService.GetWell(wellUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
    }
}
