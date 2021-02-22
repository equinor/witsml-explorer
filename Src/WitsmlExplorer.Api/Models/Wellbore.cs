using System;

namespace WitsmlExplorer.Api.Models
{
    public class Wellbore
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string WellUid { get;set; }
        public string WellName { get; set; }
        public string WellborePurpose { get; set; }
        public string WellboreParentUid { get; set; }
        public string WellboreParentName { get; set; }
        public string WellStatus { get; set; }
        public string WellType { get; set; }
        public DateTime? DateTimeCreation { get; set; }
        public DateTime? DateTimeLastChange { get; set; }
        public string ItemState { get; set; }
    }
}
