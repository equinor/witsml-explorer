using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data.Tubular;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpTubularService
    {
        Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid, CancellationToken? cancellationToken);
        Task<ICollection<Tubular>> GetTubulars(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
        Task<ICollection<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid, CancellationToken? cancellationToken);
    }

    public class EtpTubularService : EtpService, IEtpTubularService
    {
        public EtpTubularService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<Tubular> GetTubular(string wellUid, string wellboreUid, string tubularUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Tubular, tubularUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlTubulars>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return Tubular.FromWitsml(objList.Tubulars.FirstOrDefault());
        }

        public async Task<ICollection<Tubular>> GetTubulars(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Tubular);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var tubulars = resources.Select(MapResourceToTubular).ToList();

            return tubulars;
        }

        public async Task<ICollection<TubularComponent>> GetTubularComponents(string wellUid, string wellboreUid, string tubularUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Tubular, tubularUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlTubulars>(uri, cancellationToken ?? CancellationToken.None);
            return Tubular.GetTubularComponents(objList?.Tubulars?.FirstOrDefault()?.TubularComponents);
        }

        private Tubular MapResourceToTubular(Resource resource)
        {
            return new Tubular
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Tubular),
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
