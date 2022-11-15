using System.Collections.Generic;
using System.Threading.Tasks;

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
            return TypedResults.Ok(await wbGeometryService.GetWbGeometrys(wellUid, wellboreUid));
        }

        [Produces(typeof(IEnumerable<WbGeometrySection>))]
        public static async Task<IResult> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService)
        {
            return TypedResults.Ok(await wbGeometryService.GetWbGeometry(wellUid, wellboreUid, wbGeometryUid));
        }

        [Produces(typeof(IEnumerable<WbGeometrySection>))]
        public static async Task<IResult> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid, IWbGeometryService wbGeometryService)
        {
            return TypedResults.Ok(await wbGeometryService.GetWbGeometrySections(wellUid, wellboreUid, wbGeometryUid));
        }
    }
}
