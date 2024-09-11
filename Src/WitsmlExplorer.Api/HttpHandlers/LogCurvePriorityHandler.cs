using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class LogCurvePriorityHandler
    {
        [Produces(typeof(LogCurvePriorities))]
        public static async Task<IResult> GetPrioritizedCurves(string wellUid, string wellboreUid, ILogCurvePriorityService logCurvePriorityService)
        {
            var prioritizedCurves = await logCurvePriorityService.GetPrioritizedCurves(wellUid, wellboreUid) ?? new List<string>();
            var prioritizedGlobalCurves =
                await logCurvePriorityService.GetPrioritizedGlobalCurves()  ?? new List<string>();
            var result = new LogCurvePriorities()
            {
                PrioritizedCurves = prioritizedCurves,
                PrioritizedGlobalCurves = prioritizedGlobalCurves
            };
            return TypedResults.Ok(result);
        }

        [Produces(typeof(List<string>))]
        public static async Task<IResult> SetPrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var createdPrioritizedCurves = await logCurvePriorityService.SetPrioritizedCurves(wellUid, wellboreUid, prioritizedCurves) ?? new List<string>();
            return TypedResults.Ok(createdPrioritizedCurves);
        }

        [Produces(typeof(List<string>))]
        public static async Task<IResult> SetPrioritizedGlobalCurves(List<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var createdPrioritizedCurves = await logCurvePriorityService.SetPrioritizedGlobalCurves(prioritizedCurves) ?? new List<string>();
            return TypedResults.Ok(createdPrioritizedCurves);
        }
    }
}
