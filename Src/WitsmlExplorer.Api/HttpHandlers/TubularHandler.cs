using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class TubularHandler
    {
        [Produces(typeof(IEnumerable<Tubular>))]
        public static async Task<IResult> GetTubulars(string wellUid, string wellboreUid, ITubularService tubularService)
        {
            return TypedResults.Ok(await tubularService.GetTubulars(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));
        }
        [Produces(typeof(IEnumerable<Tubular>))]
        public static async Task<IResult> GetTubular(string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService)
        {
            return TypedResults.Ok(await tubularService.GetTubular(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(tubularUid)));
        }
        [Produces(typeof(IEnumerable<TubularComponent>))]
        public static async Task<IResult> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService)
        {
            return TypedResults.Ok(await tubularService.GetTubularComponents(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(tubularUid)));
        }
    }
}
