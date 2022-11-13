using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WellHandler
    {
        [Produces(typeof(IEnumerable<Well>))]
        public static async Task<IResult> GetAllWells(IWellService wellService)
        {
            return wellService.HasClient() ?
                TypedResults.Ok(await wellService.GetWells()) :
                TypedResults.Unauthorized();
        }

        [Produces(typeof(Well))]
        public static async Task<IResult> GetWell(string wellUid, IWellService wellService)
        {
            return wellService.HasClient() ?
                TypedResults.Ok(await wellService.GetWell(wellUid)) :
                TypedResults.Unauthorized();
        }
    }
}
