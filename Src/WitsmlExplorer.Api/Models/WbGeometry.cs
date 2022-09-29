using System;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry : ObjectOnWellbore
    {
        public DateTime? DTimReport { get; set; }
        public MeasureWithDatum MdBottom { get; set; }
        public LengthMeasure GapAir { get; set; }
        public LengthMeasure DepthWaterMean { get; set; }
        public CommonData CommonData { get; set; }
    }
}
