using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class ObjectHandler
    {
        [Produces(typeof(ObjectSearchResult[]))]
        public static async Task<IResult> GetObjectsByType(HttpContext httpContext, EntityType objectType, IObjectService objectService)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by type for all servers is found.
            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await objectService.GetObjectsByType(objectType));
        }

        [Produces(typeof(ObjectSearchResult[]))]
        public static async Task<IResult> GetObjectsWithParamByType(HttpContext httpContext, EntityType objectType, string objectProperty, string objectPropertyValue, IObjectService objectService)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by type for all servers is found.
            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await objectService.GetObjectsWithParamByType(objectType, objectProperty, objectPropertyValue));
        }

        [Produces(typeof(ObjectOnWellbore[]))]
        public static async Task<IResult> GetObjectsIdOnly(HttpContext httpContext, string wellUid, string wellboreUid, EntityType objectType, IObjectService objectService, IEtpObjectService etpObjectService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid))
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpObjectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType, cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            return TypedResults.Ok(await objectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType));
        }

        [Produces(typeof(ObjectOnWellbore))]
        public static async Task<IResult> GetObjectIdOnly(HttpContext httpContext, string wellUid, string wellboreUid, string objectUid, EntityType objectType, IObjectService objectService, IEtpObjectService etpObjectService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid) && !string.IsNullOrWhiteSpace(objectUid))
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                ObjectOnWellbore etpResult = await etpObjectService.GetObjectIdOnly(wellUid, wellboreUid, objectUid, objectType, cancellationToken);
                return TypedResults.Ok(etpResult);
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            IEnumerable<ObjectOnWellbore> result = await objectService.GetObjectIdOnly(wellUid, wellboreUid, objectUid, objectType);
            return TypedResults.Ok(result?.FirstOrDefault());
        }

        [Produces(typeof(Dictionary<EntityType, int>))]
        public static async Task<IResult> GetExpandableObjectsCount(HttpContext httpContext, string wellUid, string wellboreUid, IObjectService objectService, IEtpObjectService etpObjectService, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            if (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid))
            {
                httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Etp.ToString();
                return TypedResults.Ok(await etpObjectService.GetExpandableObjectsCount(wellUid, wellboreUid, cancellationToken));
            }

            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            Dictionary<EntityType, int> result = await objectService.GetExpandableObjectsCount(wellUid, wellboreUid);
            return TypedResults.Ok(result);
        }

        [Produces(typeof(IEnumerable<SelectableObjectOnWellbore>))]
        public static async Task<IResult> GetAllObjectsOnWellbore(HttpContext httpContext, string wellUid, string wellboreUid, IObjectService objectService)
        {
            // ETP is omitted since we need the log index type without querying each log individually. Implement this if a reliable way to get the log index type from an ETP Resource is found.
            httpContext.Response.Headers[EssentialHeaders.WitsmlProtocolHeader] = WitsmlProtocol.Soap.ToString();
            IEnumerable<SelectableObjectOnWellbore> result = await objectService.GetAllObjectsOnWellbore(wellUid, wellboreUid);
            return TypedResults.Ok(result);
        }
    }
}
