using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class RigHandler
{
    public static async Task<IResult> GetRigs(string wellUid, string wellboreUid, IRigService rigService)
    {
        try
        {
            return Results.Ok(await rigService.GetRigs(wellUid, wellboreUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
    public static async Task<IResult> GetRig(string wellUid, string wellboreUid, string rigUid, IRigService rigService)
    {
        try
        {
            return Results.Ok(await rigService.GetRig(wellUid, wellboreUid, rigUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
