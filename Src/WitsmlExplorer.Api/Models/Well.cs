using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class Well
    {
        public string Uid { get; init; }
        public string Name { get; init; }
        public string Field { get; init; }
        public string TimeZone { get; init; }
        public string Operator { get; init; }
        public string DateTimeCreation { get; init; }
        public string DateTimeLastChange { get; init; }
        public string ItemState { get; init; }
        public IEnumerable<Wellbore> Wellbores { get; set; }
        public string Country { get; init; }
        public string StatusWell { get; init; }
        public string PurposeWell { get; init; }
        public WellDatum WellDatum { get; init; }
        public string WaterDepth { get; init; }
        public WellLocation WellLocation { get; init; }
    }
}
