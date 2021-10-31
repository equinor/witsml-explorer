using System;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class Well
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string Field { get; set; }
        public string TimeZone { get; set; }
        public string Operator { get; set; }
        public DateTime? DateTimeCreation { get; set; }
        public DateTime? DateTimeLastChange { get; set; }
        public string ItemState { get; set; }
        public IEnumerable<Wellbore> Wellbores { get; set; }
        public string Country { get; set; }
        public string StatusWell { get; set; }
        public string PurposeWell { get; set; }
        public WellDatum WellDatum { get; set; }
        public string WaterDepth { get; set; }
        public WellLocation WellLocation { get; set; }
    }
}
