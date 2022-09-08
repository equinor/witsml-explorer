using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class MudLogHandler
    {
        [Produces(typeof(IEnumerable<MudLog>))]
        public static async Task<IResult> GetMudLogs(string wellUid, string wellboreUid, IMudLogService mudLogService)
        {
            return Results.Ok(await mudLogService.GetMudLogs(wellUid, wellboreUid));
        }
        [Produces(typeof(MudLog))]
        public static async Task<IResult> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService)
        {
            return Results.Ok(await mudLogService.GetMudLog(wellUid, wellboreUid, mudlogUid));
        }
    }
}
