using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

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
            return TypedResults.Ok(await trajectoryService.GetTrajectories(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));

        }
        [Produces(typeof(Trajectory))]
        public static async Task<IResult> GetTrajectory(string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService)
        {
            return TypedResults.Ok(await trajectoryService.GetTrajectory(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(trajectoryUid)));
        }
        [Produces(typeof(IEnumerable<TrajectoryStation>))]
        public static async Task<IResult> GetTrajectoryStations(string wellUid, string wellboreUid, string trajectoryUid, ITrajectoryService trajectoryService)
        {
            return TypedResults.Ok(await trajectoryService.GetTrajectoryStations(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(trajectoryUid)));
        }
    }
}
