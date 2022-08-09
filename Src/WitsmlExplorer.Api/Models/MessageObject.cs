using System;

namespace WitsmlExplorer.Api.Models
{
    public class MessageObject
    {
        public string Uid { get; init; }
        public string Name { get; init; }
        public string WellUid { get; init; }
        public string WellName { get; init; }
        public string WellboreName { get; init; }
        public string WellboreUid { get; init; }
        public string MessageText { get; init; }
        public DateTime? DateTimeCreation { get; init; }
        public DateTime? DateTimeLastChange { get; init; }
    }
}
