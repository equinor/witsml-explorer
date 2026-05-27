using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class LogHandler
    {
        [Produces(typeof(IEnumerable<LogObject>))]
        public static async Task<IResult> GetLogs(HttpContext httpContext, string wellUid, string wellboreUid, ILogObjectService logObjectService, IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await logObjectService.GetLogs(wellUid, wellboreUid));
        }

        [Produces(typeof(LogObject))]
        public static async Task<IResult> GetLog(HttpContext httpContext, string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService, IEtpLogService etpLogService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<LogObject> SoapCall() => logObjectService.GetLog(wellUid, wellboreUid, logUid);
            Task<LogObject> EtpCall() => etpLogService.GetLog(wellUid, wellboreUid, logUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);

        }

        [Produces(typeof(IEnumerable<LogCurveInfo>))]
        public static async Task<IResult> GetLogCurveInfo(HttpContext httpContext, string wellUid, string wellboreUid, string logUid, ILogObjectService logObjectService, IEtpLogService etpLogService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
        {
            EssentialHeaders eh = new(httpContext?.Request);
            var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
            Task<ICollection<LogCurveInfo>> SoapCall() => logObjectService.GetLogCurveInfo(wellUid, wellboreUid, logUid);
            Task<ICollection<LogCurveInfo>> EtpCall() => etpLogService.GetLogCurveInfo(wellUid, wellboreUid, logUid, cancellationToken);
            return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
        }
        [Produces(typeof(IEnumerable<MultiLogCurveInfo>))]
        public static async Task<IResult> GetMultiLogCurveInfo(HttpContext httpContext, string wellUid, string wellboreUid, [FromBody] IEnumerable<string> logUids, ILogObjectService logObjectService, IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
            return TypedResults.Ok(await logObjectService.GetMultiLogCurveInfo(wellUid, wellboreUid, logUids));
        }
        [Produces(typeof(LogData))]
        public static async Task<IResult> GetLogData(
            HttpContext httpContext,
            string wellUid,
            string wellboreUid,
            string logUid,
            [FromQuery(Name = "startIndex")] string startIndex,
            [FromQuery(Name = "endIndex")] string endIndex,
            [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
            [FromQuery(Name = "loadAllData")] bool loadAllData,
            [FromBody] IEnumerable<string> mnemonics,
            ILogObjectService logObjectService,
            IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
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
            HttpContext httpContext,
            string wellUid,
            string wellboreUid,
            [FromQuery(Name = "startIndex")] string startIndex,
            [FromQuery(Name = "endIndex")] string endIndex,
            [FromQuery(Name = "startIndexIsInclusive")] bool startIndexIsInclusive,
            [FromBody] Dictionary<string, List<string>> logMnemonics,
            ILogObjectService logObjectService,
            IProtocolCoordinator protocolCoordinator)
        {
            protocolCoordinator.SetSoapProtocolHeader(httpContext);
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
