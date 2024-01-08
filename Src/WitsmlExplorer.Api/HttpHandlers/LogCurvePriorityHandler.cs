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
            var createdPrioritizedCurves = await logCurvePriorityService.UpdatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves, false);
            return TypedResults.Ok(createdPrioritizedCurves);
        }

        [Produces(typeof(IList<string>))]
        public static async Task<IResult> UpdatePrioritizedCurves(string wellUid, string wellboreUid, IList<string> prioritizedCurves, ILogCurvePriorityService logCurvePriorityService)
        {
            var updatedPrioritizedCurves = await logCurvePriorityService.UpdatePrioritizedCurves(wellUid, wellboreUid, prioritizedCurves, true);
            return TypedResults.Ok(updatedPrioritizedCurves);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public static async Task<IResult> DeletePrioritizedCurves(string wellUid, string wellboreUid, ILogCurvePriorityService logCurvePriorityService)
        {
            await logCurvePriorityService.DeletePrioritizedCurves(wellUid, wellboreUid);
            return TypedResults.NoContent();
        }
    }
}
