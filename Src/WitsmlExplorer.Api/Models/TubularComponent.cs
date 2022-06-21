using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class TubularComponent
    {
        public string Uid { get; set; }
        public int? Sequence { get; set; }
        public LengthMeasure Id { get; set; }
        public LengthMeasure Od { get; set; }
        public LengthMeasure Len { get; set; }
        public string TypeTubularComponent { get; set; }
    }
}
