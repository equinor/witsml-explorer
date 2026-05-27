using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpWbGeometryService
    {
        Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid, CancellationToken? cancellationToken);
        Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid, CancellationToken? cancellationToken);
    }

    public class EtpWbGeometryService : EtpService, IEtpWbGeometryService
    {
        public EtpWbGeometryService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.WbGeometry, wbGeometryUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlWbGeometrys>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return WbGeometry.FromWitsml(objList.WbGeometrys.FirstOrDefault());
        }

        public async Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.WbGeometry);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var wbGeometrys = resources.Select(MapResourceToWbGeometry).ToList();

            return wbGeometrys;
        }

        public async Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.WbGeometry, wbGeometryUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlWbGeometrys>(uri, cancellationToken ?? CancellationToken.None);
            return WbGeometry.GetWbGeometrySections(objList?.WbGeometrys?.FirstOrDefault()?.WbGeometrySections);
        }

        private WbGeometry MapResourceToWbGeometry(Resource resource)
        {
            return new WbGeometry
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.WbGeometry),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri),
                CommonData = new CommonData
                {
                    DTimLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
                }
            };
        }
    }
}
