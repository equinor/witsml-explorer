using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Risk : ObjectOnWellbore
    {
        public string Type { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string ExtendCategory { get; set; }
        public string AffectedPersonnel { get; set; }
        public string DTimStart { get; set; }
        public string DTimEnd { get; set; }
        public MeasureWithDatum MdHoleStart { get; set; }
        public MeasureWithDatum MdHoleEnd { get; set; }
        public MeasureWithDatum TvdHoleStart { get; set; }
        public MeasureWithDatum TvdHoleEnd { get; set; }
        public MeasureWithDatum MdBitStart { get; set; }
        public MeasureWithDatum MdBitEnd { get; set; }
        public LengthMeasure DiaHole { get; set; }
        public string SeverityLevel { get; set; }
        public string ProbabilityLevel { get; set; }
        public string Summary { get; set; }
        public string Details { get; set; }
        public string Identification { get; set; }
        public string Contigency { get; set; }
        public string Mitigation { get; set; }
        public CommonData CommonData { get; set; }
    }
}
