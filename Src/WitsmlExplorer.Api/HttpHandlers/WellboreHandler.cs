using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers
{
    public static class WellboreHandler
    {
        [Produces(typeof(IEnumerable<Wellbore>))]
        public static async Task<IResult> GetWellbores(string wellUid, IWellboreService wellboreService, IDataWorkOrderService dataWorkOrderService)
        {
            var wellbores = await wellboreService.GetWellbores(wellUid ?? "");
            var dwo =
                await dataWorkOrderService.GetDataWorkOrders(
                    wellbores.First().WellUid, wellbores.First().Uid);
            return TypedResults.Ok(wellbores);
        }

        [Produces(typeof(Wellbore))]
        public static async Task<IResult> GetWellbore(string wellUid, string wellboreUid, IWellboreService wellboreService)
        {
            return TypedResults.Ok(await wellboreService.GetWellbore(wellUid, wellboreUid));
        }
    }
}
