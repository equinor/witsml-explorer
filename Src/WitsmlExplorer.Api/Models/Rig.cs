using System;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Rig
    {
        public LengthMeasure AirGap { get; set; }
        public string Approvals { get; set; }
        public string ClassRig { get; set; }
        public DateTime? DTimStartOp { get; set; }
        public DateTime? DTimEndOp { get; set; }
        public string EmailAddress { get; set; }
        public string FaxNumber { get; set; }
        public bool? IsOffshore { get; set; }
        public string Manufacturer { get; set; }
        public string Name { get; set; }
        public string NameWellbore { get; set; }
        public string NameWell { get; set; }
        public string NameContact { get; set; }
        public string Owner { get; set; }
        public LengthMeasure RatingDrillDepth { get; set; }
        public LengthMeasure RatingWaterDepth { get; set; }
        public string Registration { get; set; }
        public string TelNumber { get; set; }
        public string TypeRig { get; set; }
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }

        public string Uid { get; set; }
        public string YearEntService { get; set; }
        public CommonData CommonData { get; set; }
    }
}
