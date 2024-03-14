using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;
namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class RiskHandler
    {
        [Produces(typeof(IEnumerable<Risk>))]
        public static async Task<IResult> GetRisks(string wellUid, string wellboreUid, IRiskService riskService)
        {
            return TypedResults.Ok(await riskService.GetRisks(wellUid, wellboreUid));
        }
    }
}
