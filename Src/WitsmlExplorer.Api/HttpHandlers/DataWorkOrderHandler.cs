using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Services;
using WitsmlExplorer.Api.Services.ETP;

namespace WitsmlExplorer.Api.HttpHandlers;

public static class DataWorkOrderHandler
{
    [Produces(typeof(IEnumerable<DataWorkOrder>))]
    public static async Task<IResult> GetDataWorkOrders(HttpContext httpContext, string wellUid, string wellboreUid, IDataWorkOrderService dataWorkOrderService, IEtpDataWorkOrderService etpDataWorkOrderService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
    {
        EssentialHeaders eh = new(httpContext?.Request);
        var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
        Task<ICollection<DataWorkOrder>> SoapCall() => dataWorkOrderService.GetDataWorkOrders(wellUid, wellboreUid);
        Task<ICollection<DataWorkOrder>> EtpCall() => etpDataWorkOrderService.GetDataWorkOrders(wellUid, wellboreUid, cancellationToken);
        return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
    }

    [Produces(typeof(DataWorkOrder))]
    public static async Task<IResult> GetDataWorkOrder(HttpContext httpContext, string wellUid, string wellboreUid, string dwoUid, IDataWorkOrderService dataWorkOrderService, IEtpDataWorkOrderService etpDataWorkOrderService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
    {
        EssentialHeaders eh = new(httpContext?.Request);
        var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
        Task<DataWorkOrder> SoapCall() => dataWorkOrderService.GetDataWorkOrder(wellUid, wellboreUid, dwoUid);
        Task<DataWorkOrder> EtpCall() => etpDataWorkOrderService.GetDataWorkOrder(wellUid, wellboreUid, dwoUid, cancellationToken);
        return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
    }

    [Produces(typeof(IEnumerable<DataSourceConfigurationSet>))]
    public static async Task<IResult> GetDataSourceConfigurationSets(HttpContext httpContext, string wellUid, string wellboreUid, string dwoUid, IDataWorkOrderService dataWorkOrderService, IEtpDataWorkOrderService etpDataWorkOrderService, IProtocolCoordinator protocolCoordinator, CancellationToken cancellationToken)
    {
        EssentialHeaders eh = new(httpContext?.Request);
        var protocol = (eh.WitsmlProtocol == WitsmlProtocol.Etp && !string.IsNullOrWhiteSpace(wellUid) && !string.IsNullOrWhiteSpace(wellboreUid)) ? WitsmlProtocol.Etp : WitsmlProtocol.Soap;
        Task<ICollection<DataSourceConfigurationSet>> SoapCall() => dataWorkOrderService.GetDataSourceConfigurationSets(wellUid, wellboreUid, dwoUid);
        Task<ICollection<DataSourceConfigurationSet>> EtpCall() => etpDataWorkOrderService.GetDataSourceConfigurationSets(wellUid, wellboreUid, dwoUid, cancellationToken);
        return await protocolCoordinator.ExecuteOkAsync(httpContext, protocol, SoapCall, EtpCall);
    }
}
