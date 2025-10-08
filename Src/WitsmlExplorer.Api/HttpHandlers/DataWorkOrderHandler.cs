using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.HttpHandlers;

public static class DataWorkOrderHandler
{
    [Produces(typeof(IEnumerable<DataWorkOrder>))]
    public static async Task<IResult> GetDataWorkOrders(string wellUid, string wellboreUid, IDataWorkOrderService dataWorkOrderService)
    {
        return TypedResults.Ok(await dataWorkOrderService.GetDataWorkOrders(wellUid, wellboreUid));

    }
    [Produces(typeof(DataWorkOrder))]
    public static async Task<IResult> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid, IDataWorkOrderService dataWorkOrderService)
    {
        return TypedResults.Ok(await dataWorkOrderService.GetDataWorkOrder(wellUid, wellboreUid, dwoUid));
    }
}
