using System;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class MudLog : ObjectOnWellbore
    {
        public bool ObjectGrowing { get; set; }
        public string MudLogCompany { get; set; }
        public string MudLogEngineers { get; set; }
        public string StartMd { get; set; }
        public string EndMd { get; set; }
        public DateTime? DateTimeCreation { get; set; }
        public DateTime? DateTimeLastChange { get; set; }
        public List<MudLogGeologyInterval> GeologyInterval { get; set; }
        public string ItemState { get; internal set; }
        public CommonData CommonData { get; set; }
    }
}
