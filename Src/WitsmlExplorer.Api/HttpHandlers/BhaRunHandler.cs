using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class BhaRunHandler
    {
        [Produces(typeof(IEnumerable<BhaRun>))]
        public static async Task<IResult> GetBhaRuns(string wellUid, string wellboreUid, IBhaRunService bhaRunService)
        {
            return TypedResults.Ok(await bhaRunService.GetBhaRuns(wellUid, wellboreUid));

        }
        [Produces(typeof(BhaRun))]
        public static async Task<IResult> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid, IBhaRunService bhaRunService)
        {
            return TypedResults.Ok(await bhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid));
        }
    }
}
