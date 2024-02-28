using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class LogCurvePriorityHandler
    {
        [Produces(typeof(List<string>))]
        public static async Task<IResult> GetPrioritizedCurves(string wellUid, string wellboreUid, ILogCurvePriorityService logCurvePriorityService)
        {
            var prioritizedCurves = await logCurvePriorityService.GetPrioritizedCurves(wellUid, wellboreUid) ?? new List<string>();
            return TypedResults.Ok(prioritizedCurves);
        }

        [Produces(typeof(IList<string>))]
        public static async Task<IResult> SetPrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var createdPrioritizedCurves = await logCurvePriorityService.SetPrioritizedCurves(wellUid, wellboreUid, prioritizedCurves) ?? new List<string>();
            return TypedResults.Ok(createdPrioritizedCurves);
        }
    }
}
