using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public static class TubularQueries
    {
        public static WitsmlTubulars GetWitsmlTubularByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlTubulars
            {
                Tubulars = new WitsmlTubular
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    Name = "",
                    TypeTubularAssy = "",
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        public static WitsmlTubulars GetWitsmlTubularById(string wellUid, string wellboreUid, string tubularUid)
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
