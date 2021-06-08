using Witsml.Data;
using Witsml.Extensions;

namespace Witsml.Query
{
    public class TubularQueries
    {
        public static WitsmlTubulars QueryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    UidWell = wellUid,
                    UidWellbore = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlTubulars QueryById(string wellUid, string wellboreUid, string tubularUid)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = tubularUid,
                    UidWell = wellUid,
                    UidWellbore = wellboreUid

                }.AsSingletonList()
            };
        }
    }
}
