using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IFormationMarkerService
    {
        Task<FormationMarker> GetFormationMarker(string wellUid, string wellboreUid, string formationMarkerUid);
        Task<ICollection<FormationMarker>> GetFormationMarkers(string wellUid, string wellboreUid);
    }

    public class FormationMarkerService : WitsmlService, IFormationMarkerService
    {
        public FormationMarkerService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<FormationMarker> GetFormationMarker(string wellUid, string wellboreUid, string formationMarkerUid)
        {
            WitsmlFormationMarkers query = (WitsmlFormationMarkers)ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, formationMarkerUid, EntityType.FormationMarker);
            WitsmlFormationMarkers result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return FormationMarker.FromWitsml(result.FormationMarkers.FirstOrDefault());
        }
        public async Task<ICollection<FormationMarker>> GetFormationMarkers(string wellUid, string wellboreUid)
        {
            WitsmlFormationMarkers query = (WitsmlFormationMarkers)ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, "", EntityType.FormationMarker);
            WitsmlFormationMarkers result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return result.FormationMarkers.Select(FormationMarker.FromWitsml).ToList();
        }
    }
}
