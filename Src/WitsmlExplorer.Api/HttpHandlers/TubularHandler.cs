using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class TubularHandler
{
    public static async Task<IResult> GetTubulars(string wellUid, string wellboreUid, ITubularService tubularService)
    {
        try
        {
            return Results.Ok(await tubularService.GetTubulars(wellUid, wellboreUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetTubular(string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService)
    {
        try
        {
            return Results.Ok(await tubularService.GetTubular(wellUid, wellboreUid, tubularUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid, ITubularService tubularService)
    {
        try
        {
            return Results.Ok(await tubularService.GetTubularComponents(wellUid, wellboreUid, tubularUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
