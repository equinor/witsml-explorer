using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

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
            return TypedResults.Ok(await mudLogService.GetMudLogs(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));
        }

        [Produces(typeof(MudLog))]
        public static async Task<IResult> GetMudLog(string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService)
        {
            return TypedResults.Ok(await mudLogService.GetMudLog(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(mudlogUid)));
        }

        [Produces(typeof(List<MudLogGeologyInterval>))]
        public static async Task<IResult> GetGeologyIntervals(string wellUid, string wellboreUid, string mudlogUid, IMudLogService mudLogService)
        {
            MudLog mudLog = await mudLogService.GetMudLog(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(mudlogUid));
            return TypedResults.Ok(mudLog.GeologyInterval);
        }
    }
}
