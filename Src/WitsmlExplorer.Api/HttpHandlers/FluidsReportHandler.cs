using System.Collections.Generic;
using System.Threading.Tasks;

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
            return TypedResults.Ok(await fluidsReportService.GetFluidsReports(wellUid, wellboreUid));
        }

        [Produces(typeof(FluidsReport))]
        public static async Task<IResult> GetFluidsReport(string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService)
        {
            return TypedResults.Ok(await fluidsReportService.GetFluidsReport(wellUid, wellboreUid, fluidsReportUid));
        }

        [Produces(typeof(List<Fluid>))]
        public static async Task<IResult> GetFluids(string wellUid, string wellboreUid, string fluidsReportUid, IFluidsReportService fluidsReportService)
        {
            FluidsReport fluidsReport = await fluidsReportService.GetFluidsReport(wellUid, wellboreUid, fluidsReportUid);
            return TypedResults.Ok(fluidsReport.Fluids);
        }
    }
}
