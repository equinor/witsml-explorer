using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Energistics.Datatypes.Object;

using Witsml.Data;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services.ETP
{
    public interface IEtpFormationMarkerService
    {
        Task<FormationMarker> GetFormationMarker(string wellUid, string wellboreUid, string formationMarkerUid, CancellationToken? cancellationToken);
        Task<ICollection<FormationMarker>> GetFormationMarkers(string wellUid, string wellboreUid, CancellationToken? cancellationToken);
    }

    public class EtpFormationMarkerService : EtpService, IEtpFormationMarkerService
    {
        public EtpFormationMarkerService(IEtpClientProvider etpClientProvider) : base(etpClientProvider)
        {
        }

        public async Task<FormationMarker> GetFormationMarker(string wellUid, string wellboreUid, string formationMarkerUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.FormationMarker, formationMarkerUid);
            var objList = await client.GetObjectAsWitsmlAsync<WitsmlFormationMarkers>(uri, cancellationToken ?? CancellationToken.None);
            if (objList == null || !objList.Objects.Any())
            {
                return null;
            }

            return FormationMarker.FromWitsml(objList.FormationMarkers.FirstOrDefault());
        }

        public async Task<ICollection<FormationMarker>> GetFormationMarkers(string wellUid, string wellboreUid, CancellationToken? cancellationToken)
        {
            var client = await GetEtpClient(cancellationToken);
            var uri = EtpUriHelper.CreateObjectUri(wellUid, wellboreUid, EntityType.FormationMarker);
            var resources = await client.GetResourcesAsync(uri, cancellationToken ?? CancellationToken.None);
            var formationMarkers = resources.Select(MapResourceToFormationMarker).ToList();

            return formationMarkers;
        }

        private FormationMarker MapResourceToFormationMarker(Resource resource)
        {
            return new FormationMarker
            {
                Uid = EtpUriHelper.GetObjectUid(resource.uri, EntityType.FormationMarker),
                Name = resource.name,
                WellboreUid = EtpUriHelper.GetWellboreUid(resource.uri),
                WellUid = EtpUriHelper.GetWellUid(resource.uri)
            };
        }
    }
}
