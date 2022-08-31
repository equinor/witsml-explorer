using System;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Risk
    {
        public string WellUid { get; set; }
        public string WellboreUid { get; set; }
        public string Uid { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string ExtendCategory { get; set; }
        public string AffectedPersonnel { get; set; }
        public DateTime? DTimStart { get; set; }
        public DateTime? DTimEnd { get; set; }
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
