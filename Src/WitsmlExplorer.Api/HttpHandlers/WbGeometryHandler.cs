using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WbGeometryHandler
    {
        [Produces(typeof(IEnumerable<WbGeometry>))]
        public static async Task<IResult> GetWbGeometries(string wellUid, string wellboreUid, IWbGeometryService wbGeometryService)
        {
            return TypedResults.Ok(await wbGeometryService.GetWbGeometrys(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));
        }

        [Produces(typeof(IEnumerable<WbGeometrySection>))]
        public static async Task<IResult> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService)
        {
            return TypedResults.Ok(await wbGeometryService.GetWbGeometry(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(wbGeometryUid)));
        }

        [Produces(typeof(IEnumerable<WbGeometrySection>))]
        public static async Task<IResult> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService)
        {
            return TypedResults.Ok(await wbGeometryService.GetWbGeometrySections(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(wbGeometryUid)));
        }
    }
}
