using Witsml.Data;
using Witsml.Extensions;

namespace Witsml.Query
{
    public static class RigQueries
    {
        public static WitsmlRigs QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    Owner = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    AirGap = "",
                    TypeRig = ""
                }.AsSingletonList()
            };
        }

        public static WitsmlRigs QueryById(string wellUid, string wellboreUid, string rigUid)
        {
            return new WitsmlRigs
            {
                Rigs = new WitsmlRig
                {
                    Owner = "",
                    Uid = rigUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }
    }
}
