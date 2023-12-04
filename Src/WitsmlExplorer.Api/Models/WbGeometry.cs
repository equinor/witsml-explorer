using Witsml.Data;
using Witsml.Data.Measures;

using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry : ObjectOnWellbore
    {
        public string DTimReport { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public LengthMeasure GapAir { get; init; }
        public LengthMeasure DepthWaterMean { get; init; }
        public CommonData CommonData { get; init; }

        public override WitsmlWbGeometrys ToWitsml()
        {
            return new WitsmlWbGeometry
            {
                UidWell = WellUid,
                NameWell = WellName,
                UidWellbore = WellboreUid,
                NameWellbore = WellboreName,
                Uid = Uid,
                Name = Name,
                DTimReport = StringHelpers.ToUniversalDateTimeString(DTimReport),
                MdBottom = MdBottom?.ToWitsml<WitsmlMeasuredDepthCoord>(),
                GapAir = GapAir?.ToWitsml<WitsmlLengthMeasure>(),
                DepthWaterMean = DepthWaterMean?.ToWitsml<WitsmlLengthMeasure>(),
                CommonData = CommonData?.ToWitsml(),
            }.AsItemInWitsmlList();
        }
    }
}
