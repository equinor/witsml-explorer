using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class MudLogHandler
{
    public static async Task<IResult> GetMudLogs(string wellUid, string wellboreUid, IMudLogService mudLogService)
    {
        try
        {
            return Results.Ok(await mudLogService.GetMudLogs(wellUid, wellboreUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService)
    {
        try
        {
            return Results.Ok(await mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
