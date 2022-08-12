using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class LogHandler
{
    public static async Task<IResult> GetLogs(string wellUid, string wellboreUid, ILogObjectService logObjectService)
    {
        try
        {
            return Results.Ok(await logObjectService.GetLogs(wellUid, wellboreUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetLog(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
    {
        try
        {
            return Results.Ok(await logObjectService.GetLog(wellUid, wellboreUid, logUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
    {
        try
        {
            return Results.Ok(await logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
