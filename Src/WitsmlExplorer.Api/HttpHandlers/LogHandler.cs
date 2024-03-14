using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class LogHandler
    {
        [Produces(typeof(IEnumerable<LogObject>))]
        public static async Task<IResult> GetLogs(string wellUid, string wellboreUid, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetLogs(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));
        }
        [Produces(typeof(LogObject))]
        public static async Task<IResult> GetLog(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetLog(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(logUid)));

        }
        [Produces(typeof(IEnumerable<LogCurveInfo>))]
        public static async Task<IResult> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetLogCurveInfo(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(logUid)));
        }
        [Produces(typeof(LogData))]
        public static async Task<IResult> GetLogData(
            string wellUid,
            string wellboreUid,
            string logUid,
            [FromQuery(Name = "startIndex")] string startIndex,
            [FromQuery(Name = "endIndex")] string endIndex,
            [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
            [FromQuery(Name = "loadAllData")] bool loadAllData,
            [FromBody] IEnumerable<string> mnemonics,
            ILogObjectService logObjectService)
        {
            if (mnemonics.Any())
            {
                var logData = await logObjectService.ReadLogData(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(logUid), mnemonics.ToList(), startIndexIsInclusive, startIndex, endIndex, loadAllData);
                return TypedResults.Ok(logData);
            }
            else
            {
                return TypedResults.BadRequest("Missing list of mnemonics");
            }
        }
    }
}
