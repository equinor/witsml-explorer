using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class FormationMarkerQueries
    {
       
        public static WitsmlFormationMarkers QueryById(string wellUid, string wellboreUid, string formationUid)
        {
            return new WitsmlFormationMarkers
            {
                FormationMarkers = new WitsmlFormationMarker
                {
                    Uid = formationUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }
        public static WitsmlFormationMarkers QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlFormationMarkers
            {
                FormationMarkers = new WitsmlFormationMarker
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                }.AsSingletonList()
            };
        }
    }
}
