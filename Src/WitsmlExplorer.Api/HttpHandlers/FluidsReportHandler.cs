using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class FluidsReportHandler
    {
        [Produces(typeof(IEnumerable<FluidsReport>))]
        public static async Task<IResult> GetFluidsReports(string wellUid, string wellboreUid, IFluidsReportService fluidsReportService)
        {
            return TypedResults.Ok(await fluidsReportService.GetFluidsReports(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid)));
        }

        [Produces(typeof(FluidsReport))]
        public static async Task<IResult> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService)
        {
            return TypedResults.Ok(await fluidsReportService.GetFluidsReport(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(fluidsReportUid)));
        }

        [Produces(typeof(List<Fluid>))]
        public static async Task<IResult> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService)
        {
            FluidsReport fluidsReport = await fluidsReportService.GetFluidsReport(HttpUtility.UrlDecode(wellUid), HttpUtility.UrlDecode(wellboreUid), HttpUtility.UrlDecode(fluidsReportUid));
            return TypedResults.Ok(fluidsReport.Fluids);
        }
    }
}
