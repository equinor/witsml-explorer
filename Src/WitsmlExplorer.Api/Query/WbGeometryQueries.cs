using Witsml.Data;
using Witsml.Extensions;

namespace WitsmlExplorer.Api.Query
{
    public class WbGeometryQueries
    {
        public static WitsmlWbGeometrys GetWitsmlWbGeometryByWellbore(string wellUid, string wellboreUid)
        {
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new WitsmlWbGeometry
                {
                    Uid = "",
                    UidWell = wellUid,
                    UidWellbore = wellboreUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }
    }
}
