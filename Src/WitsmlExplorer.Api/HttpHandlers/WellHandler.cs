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
        public static async Task<IResult> GetAllWells(HttpContext httpContext, IWellService wellService, IEtpWellService etpWellService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp)
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpWellService.GetWells(cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await wellService.GetWells());
        }

        [Produces(typeof(Well))]
        public static async Task<IResult> GetWell(HttpContext httpContext, string wellUid, IWellService wellService, IEtpWellService etpWellService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp)
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpWellService.GetWell(wellUid, cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await wellService.GetWell(wellUid));
        }
    }
}
