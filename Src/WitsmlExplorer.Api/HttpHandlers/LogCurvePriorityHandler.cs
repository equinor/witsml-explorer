using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class LogCurvePriorityHandler
    {
        [Produces(typeof(string[]))]
        public static async Task<IResult> GetPrioritizedLocalCurves(string wellUid, string wellboreUid, ILogCurvePriorityService logCurvePriorityService)
        {
            var prioritizedCurves = await logCurvePriorityService.GetPrioritizedLocalCurves(wellUid, wellboreUid) ?? new List<string>();
            return TypedResults.Ok(prioritizedCurves);
        }

        [Produces(typeof(string[]))]
        public static async Task<IResult> GetPrioritizedUniversalCurves(ILogCurvePriorityService logCurvePriorityService)
        {
            var prioritizedCurves = await logCurvePriorityService.GetPrioritizedUniversalCurves() ?? new List<string>();
            return TypedResults.Ok(prioritizedCurves);
        }

        [Produces(typeof(List<string>))]
        public static async Task<IResult> SetPrioritizedLocalCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var createdPrioritizedCurves = await logCurvePriorityService.SetPrioritizedLocalCurves(wellUid, wellboreUid, prioritizedCurves) ?? new List<string>();
            return TypedResults.Ok(createdPrioritizedCurves);
        }

        [Produces(typeof(List<string>))]
        public static async Task<IResult> SetPrioritizedUniversalCurves(List<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var createdPrioritizedCurves = await logCurvePriorityService.SetPrioritizedUniversalCurves(prioritizedCurves) ?? new List<string>();
            return TypedResults.Ok(createdPrioritizedCurves);
        }
    }
}
