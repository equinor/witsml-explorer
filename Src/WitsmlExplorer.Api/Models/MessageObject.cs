using System;

namespace WitsmlExplorer.Api.Models
{
    public class MessageObject : ObjectOnWellbore
    {
        public DateTimeOffset DTim { get; set; }
        public string MessageText { get; init; }
        public string TypeMessage { get; init; }
        public CommonData CommonData { get; init; }
    }
}
