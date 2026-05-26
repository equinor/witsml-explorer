using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data.DataWorkOrder;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.DataWorkOrder;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpDataWorkOrderService
    {
        public Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid, CancellationToken? cancellationToken);
        public Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        public Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid, CancellationToken? cancellationToken);
    }

    public class EtpDataWorkOrderService : EtpService, IEtpDataWorkOrderService
    {
        public EtpDataWorkOrderService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<DataWorkOrder> GetDataWorkOrder(string wellUid, string wellboreUid, string dwoUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.DataWorkOrder, dwoUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlDataWorkOrders>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }
            return DataWorkOrder.FromWitsml(objList.DataWorkOrders.FirstOrDefault());
        }

        public async Task<ICollection<DataWorkOrder>> GetDataWorkOrders(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.DataWorkOrder);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            return resources.Select(MapResourceToDataWorkOrder).ToList();
        }

        public async Task<ICollection<DataSourceConfigurationSet>> GetDataSourceConfigurationSets(string wellUid, string wellboreUid, string dwoUid, CancellationToken? cancellationToken)
        {
            var dataWorkOrder = await GetDataWorkOrder(wellUid, wellboreUid, dwoUid, cancellationToken);
            return dataWorkOrder?.DataSourceConfigurationSets;
        }

        private DataWorkOrder MapResourceToDataWorkOrder(Resource resource)
        {
            return new DataWorkOrder
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.DataWorkOrder),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri)
            };
        }
    }
}
