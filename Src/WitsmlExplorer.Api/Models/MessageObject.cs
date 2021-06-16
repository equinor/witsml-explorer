using System;

namespace WitsmlExplorer.Api.Models
{
    public class MessageObject
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string WellUid { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string WellboreUid { get; set; }
        public string MessageText { get; set; }

        public DateTime? DateTimeCreation { get; set; }
        public DateTime? DateTimeLastChange { get; set; }
    }
}
