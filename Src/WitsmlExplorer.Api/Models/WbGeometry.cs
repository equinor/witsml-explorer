using System;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometry
    {
        public string UidWell { get; set; }
        public string UidWellbore { get; set; }
        public string Uid { get; set; }
        public string NameWell { get; set; }
        public string NameWellbore { get; set; }
        public DateTime? DTimReport { get; set; }
        public MeasuredDepthCoord MdBottom { get; set; }
        public LengthMeasure GapAir { get; set; }
        public LengthMeasure DepthWaterMean { get; set; }
        public string SourceName { get; set; }
        public DateTime? DTimCreation { get; set; }
        public DateTime? DTimLastChange { get; set; }
        public string ItemState { get; set; }
        public string Comments { get; set; }
    }
}
