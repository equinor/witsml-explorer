using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandler;

public static class RigHandler
{
    public static async Task<IResult> GetRigs(string wellUid, string wellboreUid, IRigService rigService)
    {
        return Results.Ok(await rigService.GetRigs(wellUid, wellboreUid));
    }
    public static async Task<IResult> GetRig(string wellUid, string wellboreUid, string rigUid, IRigService rigService)
    {
        return Results.Ok(await rigService.GetRig(wellUid, wellboreUid, rigUid));
    }
}
