using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
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
            return WitsmlToFormationMarker(result.FormationMarkers.FirstOrDefault());
        }
        public async Task<ICollection<FormationMarker>> GetFormationMarkers(string wellUid, string wellboreUid)
        {
            WitsmlFormationMarkers query = (WitsmlFormationMarkers)ObjectQueries.GetWitsmlObjectById(wellUid, wellboreUid, "", EntityType.FormationMarker);
            WitsmlFormationMarkers result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));
            return result.FormationMarkers.Select(WitsmlToFormationMarker).ToList();
        }

        private static FormationMarker WitsmlToFormationMarker(WitsmlFormationMarker formationMarker)
        {
            return formationMarker == null ? null : new FormationMarker
            {
                Uid = formationMarker.Uid,
                Name = formationMarker.Name,
                WellUid = formationMarker.UidWell,
                WellName = formationMarker.NameWell,
                WellboreName = formationMarker.NameWellbore,
                WellboreUid = formationMarker.UidWellbore,
                MdPrognosed = MeasureWithDatum.FromWitsml(formationMarker.MdPrognosed),
                TvdPrognosed = MeasureWithDatum.FromWitsml(formationMarker.TvdPrognosed),
                MdTopSample = MeasureWithDatum.FromWitsml(formationMarker.MdTopSample),
                TvdTopSample = MeasureWithDatum.FromWitsml(formationMarker.TvdTopSample),
                ThicknessBed = LengthMeasure.FromWitsml(formationMarker.ThicknessBed),
                ThicknessApparent = LengthMeasure.FromWitsml(formationMarker.ThicknessApparent),
                ThicknessPerpen = LengthMeasure.FromWitsml(formationMarker.ThicknessPerpen),
                MdLogSample = MeasureWithDatum.FromWitsml(formationMarker.MdLogSample),
                TvdLogSample = MeasureWithDatum.FromWitsml(formationMarker.TvdLogSample),
                Dip = LengthMeasure.FromWitsml(formationMarker.Dip),
                DipDirection = LengthMeasure.FromWitsml(formationMarker.DipDirection),
                Lithostratigraphic = StratigraphicStruct.FromWitsml(formationMarker.Lithostratigraphic),
                Chronostratigraphic = StratigraphicStruct.FromWitsml(formationMarker.Chronostratigraphic),
                Description = formationMarker.Description,
                CommonData = new CommonData()
                {
                    DTimCreation = formationMarker.CommonData.DTimCreation,
                    DTimLastChange = formationMarker.CommonData.DTimLastChange,
                    ItemState = formationMarker.CommonData.ItemState
                }
            };
        }
    }
}
