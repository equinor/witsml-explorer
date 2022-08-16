using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class BhaRunHandler
{
    public static async Task<IResult> GetBhaRuns(string wellUid, string wellboreUid, IBhaRunService bhaRunService)
    {
        return Results.Ok(await bhaRunService.GetBhaRuns(wellUid, wellboreUid));
    }
    public static async Task<IResult> GetBhaRun(string wellUid, string wellboreUid, string bhaRunUid, IBhaRunService bhaRunService)
    {
        return Results.Ok(await bhaRunService.GetBhaRun(wellUid, wellboreUid, bhaRunUid));
    }
}
