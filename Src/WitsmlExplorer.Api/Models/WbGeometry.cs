using System;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string Uid { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string Name { get; set; }
        public DateTime? DTimReport { get; set; }
        public MeasuredDepthCoord MdBottom { get; set; }
        public LengthMeasure GapAir { get; set; }
        public LengthMeasure DepthWaterMean { get; set; }
        public CommonData CommonData { get; set; }
    }
}
