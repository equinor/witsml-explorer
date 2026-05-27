using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data.Rig;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpRigService
    {
        Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid, CancellationToken? cancellationToken);
        Task<ICollection<Rig>> GetRigs(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpRigService : EtpService, IEtpRigService
    {
        public EtpRigService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<Rig> GetRig(string wellUid, string wellboreUid, string rigUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Rig, rigUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlRigs>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return Rig.FromWitsml(objList.Rigs.FirstOrDefault());
        }

        public async Task<ICollection<Rig>> GetRigs(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.Rig);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var rigs = resources.Select(MapResourceToRig).ToList();

            return rigs;
        }

        private Rig MapResourceToRig(Resource resource)
        {
            return new Rig
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.Rig),
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
