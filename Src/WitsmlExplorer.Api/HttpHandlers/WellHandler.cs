using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class WellHandler
{
    public static async Task<IResult> GetAllWells(IWellService wellService)
    {
        try
        {
            return Results.Ok(await wellService.GetWells());
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }

    public static async Task<IResult> GetWell(string wellUid, IWellService wellService)
    {
        try
        {
            return Results.Ok(await wellService.GetWell(wellUid));
        }
        catch (Exception ex)
        {
            return Results.Problem(ex.Message);
        }
    }
}
