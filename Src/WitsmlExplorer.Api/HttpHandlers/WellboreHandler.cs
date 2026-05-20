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
    public static class WellboreHandler
    {
        [Produces(typeof(IEnumerable<Wellbore>))]
        public static async Task<IResult> GetWellbores(HttpContext httpContext, string wellUid, IWellboreService wellboreService, IEtpWellboreService etpWellboreService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid)) // Remove last condition if we find a reliable way to get all wellbores for all wells that works on all servers via ETP.
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpWellboreService.GetWellbores(wellUid, cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await wellboreService.GetWellbores(wellUid ?? ""));
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellbore(HttpContext httpContext, string wellUid, string wellboreUid, IWellboreService wellboreService, IEtpWellboreService etpWellboreService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid))
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpWellboreService.GetWellbore(wellUid, wellboreUid, cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await wellboreService.GetWellbore(wellUid, wellboreUid));
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellboreByName(HttpContext httpContext, string wellboreName, IWellboreService wellboreService)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by name for all servers is found.
            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await wellboreService.GetWellboreByName(wellboreName));
        }
    }
}
