using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class ObjectHandler
    {
        [Produces(typeof(ObjectOnWellbore[]))]
        public static async Task<IResult> GetObjectsIdOnly(string wellUid, string wellboreUid, EntityType objectType, IObjectService objectService)
        {
            return TypedResults.Ok(await objectService.GetObjectsIdOnly(wellUid, wellboreUid, objectType));
        }
    }
}
