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
            return Results.Ok(await wbGeometryService.GetWbGeometrys(wellUid, wellboreUid));
        }
    }
}
