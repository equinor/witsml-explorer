using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpWellboreService
    {
        Task<IList<Wellbore>> GetWellbores(string wellUid, CancellationToken? cancellationToken);
        Task<Wellbore> GetWellbore(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpWellboreService : EtpService, IEtpWellboreService
    {
        public EtpWellboreService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<IList<Wellbore>> GetWellbores(string wellUid, CancellationToken? cancellationToken = null)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateWellboreUri(wellUid);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);

            var wellbores = resources.Select(MapResourceToWellbore).ToList();
            return wellbores;
        }

        public async Task<Wellbore> GetWellbore(string wellUid, string wellboreUid, CancellationToken? cancellationToken = null)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateWellboreUri(wellUid, wellboreUid);
            var witsmlWellbores = await client.GetObjectAsWitsmlAsync<WitsmlWellbores>(uri, cancellationToken ?? CancellationToken.None);
            var wellbore = Wellbore.FromWitsml(witsmlWellbores.Wellbores.FirstOrDefault());
            return wellbore;
        }

        private Wellbore MapResourceToWellbore(Resource resource)
        {
            return new Wellbore
            {
                Uid = EtpUriHelper.GetWellboreUid(resource.uri),
                Name = resource.name,
                WellUid = EtpUriHelper.GetWellUid(resource.uri),
                DateTimeLastChange = ToUtcDateTimeLastChange(resource.lastChanged)
            };
        }
    }
}
