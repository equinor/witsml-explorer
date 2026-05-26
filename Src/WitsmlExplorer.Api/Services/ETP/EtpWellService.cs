using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpWellService
    {
        Task<IList<Well>> GetWells(CancellationToken? cancellationToken);
        Task<Well> GetWell(string wellUid, CancellationToken? cancellationToken);
    }

    public class EtpWellService : EtpService, IEtpWellService
    {
        public EtpWellService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<IList<Well>> GetWells(CancellationToken? cancellationToken = null)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateWellUri();
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);

            var wells = resources.Select(MapResourceToWell).ToList();
            return wells;
        }

        public async Task<Well> GetWell(string wellUid, CancellationToken? cancellationToken = null)
        {
            var client = await GetEtpClient();
            var uri = EtpUriHelper.CreateWellUri(wellUid);
            var witsmlWells = await client.GetObjectAsWitsmlAsync<WitsmlWells>(uri, cancellationToken ?? CancellationToken.None);
            var well = Well.FromWitsml(witsmlWells.Wells.FirstOrDefault());
            return well;
        }

        private Well MapResourceToWell(Resource resource)
        {
            return new Well
            {
                Uid = EtpUriHelper.GetWellUid(resource.uri),
                Name = resource.name,
                DateTimeLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
            };
        }
    }
}
