using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Risk : ObjectOnWellbore
    {
        public string Type { get; init; }
        public string Category { get; init; }
        public string SubCategory { get; init; }
        public string ExtendCategory { get; init; }
        public string AffectedPersonnel { get; init; }
        public string DTimStart { get; init; }
        public string DTimEnd { get; init; }
        public MeasureWithDatum MdHoleStart { get; init; }
        public MeasureWithDatum MdHoleEnd { get; init; }
        public MeasureWithDatum TvdHoleStart { get; init; }
        public MeasureWithDatum TvdHoleEnd { get; init; }
        public MeasureWithDatum MdBitStart { get; init; }
        public MeasureWithDatum MdBitEnd { get; init; }
        public LengthMeasure DiaHole { get; init; }
        public string SeverityLevel { get; init; }
        public string ProbabilityLevel { get; init; }
        public string Summary { get; init; }
        public string Details { get; init; }
        public string Identification { get; init; }
        public string Contigency { get; init; }
        public string Mitigation { get; init; }
        public CommonData CommonData { get; init; }
    }
}
