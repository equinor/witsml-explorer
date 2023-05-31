using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Rig : ObjectOnWellbore
    {
        public LengthMeasure AirGap { get; init; }
        public string Approvals { get; init; }
        public string ClassRig { get; init; }
        public string DTimStartOp { get; init; }
        public string DTimEndOp { get; init; }
        public string EmailAddress { get; init; }
        public string FaxNumber { get; init; }
        public bool? IsOffshore { get; init; }
        public string Manufacturer { get; init; }
        public string NameContact { get; init; }
        public string Owner { get; init; }
        public LengthMeasure RatingDrillDepth { get; init; }
        public LengthMeasure RatingWaterDepth { get; init; }
        public string Registration { get; init; }
        public string TelNumber { get; init; }
        public string TypeRig { get; init; }
        public string YearEntService { get; init; }
        public CommonData CommonData { get; init; }
    }
}
