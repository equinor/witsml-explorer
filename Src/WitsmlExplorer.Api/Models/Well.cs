using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Well
    {
        public string Uid { get; init; }
        public string Name { get; init; }
        public string Field { get; init; }
        public string TimeZone { get; init; }
        public string Operator { get; init; }
        public string NumLicense { get; init; }
        public string DateTimeCreation { get; init; }
        public string DateTimeLastChange { get; init; }
        public string ItemState { get; init; }
        public string Country { get; init; }
        public string StatusWell { get; init; }
        public string PurposeWell { get; init; }
        public bool? IsActive { get; set; }
        public LengthMeasure WaterDepth { get; init; }
        public List<WellDatum> WellDatum { get; init; }
        public List<Location> WellLocation { get; init; }
        public List<ReferencePoint> ReferencePoint { get; init; }
    }
}
