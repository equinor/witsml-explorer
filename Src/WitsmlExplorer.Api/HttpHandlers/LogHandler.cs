using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

using WitsmlExplorer.Api.Services;



namespace WitsmlExplorer.Api.HttpHandler;

public static class LogHandler
{
    public static async Task<IResult> GetLogs(string wellUid, string wellboreUid, ILogObjectService logObjectService)
    {
        return Results.Ok(await logObjectService.GetLogs(wellUid, wellboreUid));
    }
    public static async Task<IResult> GetLog(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
    {
        return Results.Ok(await logObjectService.GetLog(wellUid, wellboreUid, logUid));
    }
    public static async Task<IResult> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
    {
        return Results.Ok(await logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid));
    }

    public static async Task<IResult> GetLogData(
        string wellUid,
        string wellboreUid,
        string logUid,
        [FromQuery(Name = "startIndex")] string startIndex,
        [FromQuery(Name = "endIndex")] string endIndex,
        [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
        HttpRequest httpRequest,
        ILogObjectService logObjectService)
    {
        // Support for StringValues will arrive in NET7, ref: https://github.com/dotnet/aspnetcore/issues/36726
        // This code can be moved to the signature: [FromQuery(Name = "mnemonic")] StringValues mnemonics,
        if (httpRequest.Query.TryGetValue("mnemonic", out var mnemonics))
        {
            var logData = await logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics.ToList(), startIndexIsInclusive, startIndex, endIndex);
            return Results.Ok(logData);
        }
        else
        {
            return Results.BadRequest("Missing list of mnemonics");
        }
    }

    public static async Task<IResult> GetLargeLogData(
        string wellUid,
        string wellboreUid,
        string logUid,
        [FromQuery(Name = "startIndex")] string startIndex,
        [FromQuery(Name = "endIndex")] string endIndex,
        [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
        HttpRequest httpRequest,
        ILogObjectService logObjectService)
    {
        var mnemonics = (await httpRequest.ReadFromJsonAsync<IEnumerable<string>>() ?? Array.Empty<string>()).ToList();
        if (mnemonics.Any())
        {
            var logData = await logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics, startIndexIsInclusive, startIndex, endIndex);
            return Results.Ok(logData);
        }
        else
        {
            return Results.BadRequest("Missing list of mnemonics");
        }
    }
}
