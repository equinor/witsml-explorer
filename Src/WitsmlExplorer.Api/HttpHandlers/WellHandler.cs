using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class WellHandler
{
    public static async Task<IResult> GetAllWells(IWellService wellService)
    {
        return Results.Ok(await wellService.GetWells());
    }

    public static async Task<IResult> GetWell(string wellUid, IWellService wellService)
    {
        return Results.Ok(await wellService.GetWell(wellUid));
    }
}
