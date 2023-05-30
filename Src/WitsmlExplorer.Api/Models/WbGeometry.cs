using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry : ObjectOnWellbore
    {
        public string DTimReport { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public LengthMeasure GapAir { get; init; }
        public LengthMeasure DepthWaterMean { get; init; }
        public CommonData CommonData { get; init; }
    }
}
