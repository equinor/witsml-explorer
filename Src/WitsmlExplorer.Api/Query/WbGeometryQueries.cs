using System.Globalization;

using Witsml.Data;
using Witsml.Data.Measures;
using Witsml.Extensions;

using WitsmlExplorer.Api.Models;

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
                    WellUid = wellUid,
                    WellboreUid = wellboreUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }



        public static WitsmlWbGeometrys GetWitsmlWbGeometryById(string wellUid, string wellboreUid, string wbGeometryUid)
        {
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new WitsmlWbGeometry
                {
                    Uid = wbGeometryUid,
                    WellUid = wellUid,
                    WellboreUid = wellboreUid
                }.AsSingletonList()
            };
        }

        public static WitsmlWbGeometrys CreateWbGeometry(WbGeometry wbGeometry)
        {
            return new WitsmlWbGeometrys
            {
                WbGeometrys = new WitsmlWbGeometry
                {
                    WellUid = wbGeometry.WellUid,
                    WellboreUid = wbGeometry.WellboreUid,
                    Uid = wbGeometry.Uid,
                    Name = wbGeometry.Name,
                    WellName = wbGeometry.WellName,
                    WellboreName = wbGeometry.WellboreName,
                    DTimReport = wbGeometry.DTimReport?.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    MdBottom = wbGeometry.MdBottom != null ? new WitsmlMeasuredDepthCoord { Uom = wbGeometry.MdBottom.Uom, Value = wbGeometry.MdBottom.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    GapAir = wbGeometry.GapAir != null ? new WitsmlLengthMeasure { Uom = wbGeometry.GapAir.Uom, Value = wbGeometry.GapAir.Value.ToString(CultureInfo.InvariantCulture) } : null,
                    DepthWaterMean = wbGeometry.DepthWaterMean != null ? new WitsmlLengthMeasure { Uom = wbGeometry.DepthWaterMean.Uom, Value = wbGeometry.DepthWaterMean.Value.ToString(CultureInfo.InvariantCulture) } : null,

                    CommonData = new WitsmlCommonData()
                    {
                        Comments = wbGeometry.CommonData.Comments,
                        ItemState = wbGeometry.CommonData.ItemState,
                        SourceName = wbGeometry.CommonData.SourceName,
                        DTimCreation = null,
                        DTimLastChange = null
                    }
                }.AsSingletonList()
            };
        }
    }
}
