using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class WellboreHandler
{
    public static async Task<IResult> GetWellbore(string wellUid, string wellboreUid, IWellboreService wellboreService)
    {
        return Results.Ok(await wellboreService.GetWellbore(wellUid, wellboreUid));
    }
}
