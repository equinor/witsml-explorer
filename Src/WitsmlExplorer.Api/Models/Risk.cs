using System;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class Risk
    {
        public string UidWell { get; set; }
        public string UidWellbore { get; set; }
        public string Uid { get; set; }
        public string NameWell { get; set; }
        public string NameWellbore { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string ExtendCategory { get; set; }
        public string AffectedPersonnel { get; set; }
        public DateTime? DTimStart { get; set; }
        public DateTime? DTimEnd { get; set; }
        public string MdBitStart { get; set; }
        public string MdBitEnd { get; set; }
        public string SeverityLevel { get; set; }
        public string ProbabilityLevel { get; set; }
        public string Summary { get; set; }
        public string Details { get; set; }
        public string SourceName { get; set; }
        public CommonData CommonData { get; set; }
    }
}
