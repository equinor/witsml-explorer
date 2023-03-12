using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class FormationMarkerHandler
    {
        [Produces(typeof(IEnumerable<FormationMarker>))]
        public static async Task<IResult> GetFormationMarkers(string wellUid, string wellboreUid, IFormationMarkerService formationMarkerService)
        {
            return TypedResults.Ok(await formationMarkerService.GetFormationMarkers(wellUid, wellboreUid));

        }
        [Produces(typeof(FormationMarker))]
        public static async Task<IResult> GetFormationMarker(string wellUid, string wellboreUid, string formationMarkerUid, IFormationMarkerService formationMarkerService)
        {
            return TypedResults.Ok(await formationMarkerService.GetFormationMarker(wellUid, wellboreUid, formationMarkerUid));
        }
    }
}
