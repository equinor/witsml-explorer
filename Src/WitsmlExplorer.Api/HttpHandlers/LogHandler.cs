using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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
            return TypedResults.Ok(await logObjectService.GetLogs(wellUid, wellboreUid));
        }
        [Produces(typeof(LogObject))]
        public static async Task<IResult> GetLog(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetLog(wellUid, wellboreUid, logUid));

        }
        [Produces(typeof(IEnumerable<LogCurveInfo>))]
        public static async Task<IResult> GetLogCurveInfo(string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid));
        }
        [Produces(typeof(IEnumerable<MultiLogCurveInfo>))]
        public static async Task<IResult> GetMultiLogCurveInfo(string wellUid, string wellboreUid, [FromBody] IEnumerable<string> logUids, ILogObjectService logObjectService)
        {
            return TypedResults.Ok(await logObjectService.GetMultiLogCurveInfo(wellUid, wellboreUid, logUids));
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
                var logData = await logObjectService.ReadLogData(wellUid, wellboreUid, logUid, mnemonics.ToList(), startIndexIsInclusive, startIndex, endIndex, loadAllData, CancellationToken.None);
                return TypedResults.Ok(logData);
            }
            else
            {
                return TypedResults.BadRequest("Missing list of mnemonics");
            }
        }

        [Produces(typeof(LogData))]
        public static async Task<IResult> GetMultiLogData(
            string wellUid,
            string wellboreUid,
            [FromQuery(Name = "startIndex")] string startIndex,
            [FromQuery(Name = "endIndex")] string endIndex,
            [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
            [FromBody] Dictionary<string, List<string>> logMnemonics,
            ILogObjectService logObjectService)
        {
            if (logMnemonics.Count > 0)
            {
                var multiLogData = await logObjectService.GetMultiLogData(wellUid, wellboreUid, startIndex, endIndex, startIndexIsInclusive, logMnemonics);
                return TypedResults.Ok(multiLogData);
            }
            else
            {
                return TypedResults.BadRequest("Missing dict of requested logs and mnemonics");
            }
        }
    }
}
