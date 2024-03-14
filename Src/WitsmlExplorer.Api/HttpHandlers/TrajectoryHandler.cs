using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class TrajectoryHandler
    {
        [Produces(typeof(IEnumerable<Trajectory>))]
        public static async Task<IResult> GetTrajectories(string wellUid, string wellboreUid, ITrajectoryService trajectoryService)
        {
            return TypedResults.Ok(await trajectoryService.GetTrajectories(wellUid, wellboreUid));

        }
        [Produces(typeof(Trajectory))]
        public static async Task<IResult> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService)
        {
            return TypedResults.Ok(await trajectoryService.GetTrajectory(wellUid, wellboreUid, trajectoryUid));
        }
        [Produces(typeof(IEnumerable<TrajectoryStation>))]
        public static async Task<IResult> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService)
        {
            return TypedResults.Ok(await trajectoryService.GetTrajectoryStations(wellUid, wellboreUid, trajectoryUid));
        }
    }
}
