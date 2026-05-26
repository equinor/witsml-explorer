using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data.DataWorkOrder;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models.DataWorkOrder;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IDataWorkOrderService
    {
        Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid);
        Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid);
        Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid);
    }

    public class DataWorkOrderService : WitsmlService, IDataWorkOrderService
    {
        public DataWorkOrderService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid)
        {
            WitsmlDataWorkOrders query = DataWorkOrderQueries.GetShortWitsmlDataWorkOrder(wellUid, wellboreUid, dwoUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            return DataWorkOrder.FromWitsml(result.DataWorkOrders.FirstOrDefault());
        }

        public async Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid)
        {
            WitsmlDataWorkOrders dwoQuery = DataWorkOrderQueries.GetShortWitsmlDataWorkOrder(wellUid, wellboreUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(dwoQuery, new OptionsIn(ReturnElements.Requested));
            return result.DataWorkOrders.Select(DataWorkOrder.FromWitsml).OrderBy(dataWorkOrder => dataWorkOrder.Name).ToList();
        }

        public async Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid)
        {
            WitsmlDataWorkOrders dwoQuery = DataWorkOrderQueries.QueryById(wellUid, wellboreUid, dwoUid);
            WitsmlDataWorkOrders result = await _witsmlClient.GetFromStoreAsync(dwoQuery, new OptionsIn(ReturnElements.All));
            return DataWorkOrder.FromWitsml(result?.DataWorkOrders?.FirstOrDefault())?.DataSourceConfigurationSets;
        }
    }
}
