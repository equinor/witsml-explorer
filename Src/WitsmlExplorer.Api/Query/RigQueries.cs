using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class RigQueries
    {
        public static WitsmlRigs GetWitsmlRigByWellbore(string wellUid, string wellboreUid)
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

        public static WitsmlRigs GetWitsmlRigById(string wellUid, string wellboreUid, string rigUid)
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
