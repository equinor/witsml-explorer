using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WellboreHandler
    {
        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellbore(string wellUid, string wellboreUid, IWellboreService wellboreService)
        {
            return wellboreService.HasClient() ?
                TypedResults.Ok(await wellboreService.GetWellbore(wellUid, wellboreUid)) :
                TypedResults.Unauthorized();
        }
    }
}
