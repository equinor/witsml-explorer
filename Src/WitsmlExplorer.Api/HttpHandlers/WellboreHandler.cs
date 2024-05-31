using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WellboreHandler
    {
        [Produces(typeof(IEnumerable<Wellbore>))]
        public static async Task<IResult> GetWellbores(string wellUid, IWellboreService wellboreService)
        {
            return TypedResults.Ok(await wellboreService.GetWellbores(wellUid ?? ""));
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellbore(string wellUid, string wellboreUid, IWellboreService wellboreService)
        {
            return TypedResults.Ok(await wellboreService.GetWellbore(wellUid, wellboreUid));
        }
    }
}
