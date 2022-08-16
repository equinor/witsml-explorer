using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class MudLogHandler
{
    public static async Task<IResult> GetMudLogs(string wellUid, string wellboreUid, IMudLogService mudLogService)
    {
        return Results.Ok(await mudLogService.GetMudLogs(wellUid, wellboreUid));
    }
    public static async Task<IResult> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService)
    {
        return Results.Ok(await mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid));
    }
}
