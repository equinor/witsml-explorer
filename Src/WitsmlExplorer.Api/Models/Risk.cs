using System;
using System.Collections.Generic;

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
        public string MdHoleStart { get; set; }
        public string MdHoleEnd { get; set; }
        public string TvdHoleStart { get; set; }
        public string TvdHoleEnd { get; set; }
        public string MdBitStart { get; set; }
        public string MdBitEnd { get; set; }
        public string DiaHole { get; set; }
        public string SeverityLevel { get; set; }
        public string ProbabilityLevel { get; set; }
        public string Summary { get; set; }
        public string Details { get; set; }
        public string Identification { get; set; }
        public string Contigency { get; set; }
        public string Mitigation { get; set; }
        public string SourceName { get; set; }
        public string ItemState { get; set; }
        public DateTime? DTimCreation { get; set; }
        public DateTime? DTimLastChange { get; set; }
        public CommonData CommonData { get; set; }
    }
}
