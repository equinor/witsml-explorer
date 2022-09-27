using System;

namespace WitsmlExplorer.Api.Models
{
    public class MessageObject : ObjectOnWellbore
    {
        public string MessageText { get; init; }
        public DateTime? DateTimeCreation { get; init; }
        public DateTime? DateTimeLastChange { get; init; }
    }
}
