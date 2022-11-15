using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class RigHandler
    {
        [Produces(typeof(IEnumerable<Rig>))]
        public static async Task<IResult> GetRigs(string wellUid, string wellboreUid, IRigService rigService)
        {
            return TypedResults.Ok(await rigService.GetRigs(wellUid, wellboreUid));
        }
        [Produces(typeof(Rig))]
        public static async Task<IResult> GetRig(string wellUid, string wellboreUid, string rigUid, IRigService rigService)
        {
            return TypedResults.Ok(await rigService.GetRig(wellUid, wellboreUid, rigUid));
        }
    }
}
