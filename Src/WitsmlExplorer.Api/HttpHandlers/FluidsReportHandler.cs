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
    }
}
