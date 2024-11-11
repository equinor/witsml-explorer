using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class TubularComponent
    {
        public string Uid { get; set; }
        public string TypeTubularComponent { get; set; }
        public int? Sequence { get; set; }
        public string Description { get; set; }
        public LengthMeasure Id { get; set; }
        public LengthMeasure Od { get; set; }
        public LengthMeasure Len { get; set; }
        public int? NumJointStand { get; set; }
        public LengthMeasure WtPerLen { get; set; }
        public string ConfigCon { get; set; }
        public string TypeMaterial { get; set; }
        public string Vendor { get; set; }
        public string Model { get; set; }
    }
}
