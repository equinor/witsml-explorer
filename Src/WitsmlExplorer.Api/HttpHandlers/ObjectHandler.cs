using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class ObjectHandler
    {
        [Produces(typeof(ObjectSearchResult[]))]
        public static async Task<IResult> GetObjectsByType(EntityType objectType, IObjectService objectService)
        {
            return TypedResults.Ok(await objectService.GetObjectsByType(objectType));
        }

        [Produces(typeof(ObjectSearchResult[]))]
        public static async Task<IResult> GetObjectsWithParamByType(EntityType objectType, string objectProperty, string objectPropertyValue, IObjectService objectService)
        {
            return TypedResults.Ok(await objectService.GetObjectsWithParamByType(objectType, objectProperty, objectPropertyValue));
        }

        [Produces(typeof(ObjectOnWellbore[]))]
        public static async Task<IResult> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType, IObjectService objectService)
        {
            return TypedResults.Ok(await objectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType));
        }

        [Produces(typeof(ObjectOnWellbore))]
        public static async Task<IResult> GetObjectIdOnly(string wellUid, string wellboreUid, string objectUid, EntityType objectType, IObjectService objectService)
        {
            IEnumerable<ObjectOnWellbore> result = await objectService.GetObjectIdOnly(wellUid, wellboreUid, objectUid, objectType);
            return TypedResults.Ok(result?.FirstOrDefault());
        }

        [Produces(typeof(Dictionary<EntityType, int>))]
        public static async Task<IResult> GetExpandableObjectsCount(string wellUid, string wellboreUid, IObjectService objectService)
        {
            Dictionary<EntityType, int> result = await objectService.GetExpandableObjectsCount(wellUid, wellboreUid);
            return TypedResults.Ok(result);
        }
    }
}
