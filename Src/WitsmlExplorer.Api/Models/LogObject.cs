using System;

namespace WitsmlExplorer.Api.Models
{
    public class LogObject
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string IndexType { get; set; }
        public string WellUid { get; set; }
        public string WellName { get; set; }
        public string WellboreUid { get; set; }
        public string WellboreName { get; set; }
        public string StartIndex { get; set; }
        public string EndIndex { get; set; }
        public bool ObjectGrowing { get; set; }
        public string ServiceCompany { get; set; }
        public string RunNumber { get; set; }
        public DateTime DateTimeCreation { get; set; }
        public DateTime? DateTimeLastChange { get; set; }
        public string IndexCurve { get; set; }
    }
}
