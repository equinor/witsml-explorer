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
        public static async Task<IResult> GetObjectsByType(HttpContext httpContext, EntityType objectType, IObjectService objectService, IProtocolCoordinator protocolCoordinator)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by type for all servers is found.
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await objectService.GetObjectsByType(objectType));
        }

        [Produces(typeof(ObjectSearchResult[]))]
        public static async Task<IResult> GetObjectsWithParamByType(HttpContext httpContext, EntityType objectType, string objectProperty, string objectPropertyValue, IObjectService objectService, IProtocolCoordinator protocolCoordinator)
        {
            // ETP is omitted since query capabilities lack documentation. Implement this if a reliable way to query by type for all servers is found.
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await objectService.GetObjectsWithParamByType(objectType, objectProperty, objectPropertyValue));
        }

        [Produces(typeof(ObjectOnWellbore[]))]
        public static async Task<IResult> GetObjectsIdOnly(HttpContext httpContext, string wellUid, string wellboreUid, EntityType objectType, IObjectService objectService, IEtpObjectService etpObjectService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<ObjectOnWellbore>> SoapCall() => objectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType);
            Task<ICollection<ObjectOnWellbore>> EtpCall() => etpObjectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(ObjectOnWellbore))]
        public static async Task<IResult> GetObjectIdOnly(HttpContext httpContext, string wellUid, string wellboreUid, string objectUid, EntityType objectType, IObjectService objectService, IEtpObjectService etpObjectService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid) && !string.IsNullOrWhiteSpace(objectUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            async Task<ObjectOnWellbore> SoapCall()
            {
                IEnumerable<ObjectOnWellbore> result = await objectService.GetObjectIdOnly(wellUid, wellboreUid, objectUid, objectType);
                return result?.FirstOrDefault();
            }
            Task<ObjectOnWellbore> EtpCall() => etpObjectService.GetObjectIdOnly(wellUid, wellboreUid, objectUid, objectType, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(Dictionary<EntityType, int>))]
        public static async Task<IResult> GetExpandableObjectsCount(HttpContext httpContext, string wellUid, string wellboreUid, IObjectService objectService, IEtpObjectService etpObjectService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<Dictionary<EntityType, int>> SoapCall() => objectService.GetExpandableObjectsCount(wellUid, wellboreUid);
            Task<Dictionary<EntityType, int>> EtpCall() => etpObjectService.GetExpandableObjectsCount(wellUid, wellboreUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }

        [Produces(typeof(IEnumerable<SelectableObjectOnWellbore>))]
        public static async Task<IResult> GetAllObjectsOnWellbore(HttpContext httpContext, string wellUid, string wellboreUid, IObjectService objectService, IProtocolCoordinator protocolCoordinator)
        {
            // ETP is omitted since we need the log index type without querying each log individually. Implement this if a reliable way to get the log index type from an ETP Resource is found.
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await objectService.GetAllObjectsOnWellbore(wellUid, wellboreUid));
        }
    }
}
