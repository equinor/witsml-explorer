using System;

namespace WitsmlExplorer.Api.Models
{
    public class CommonData
    {
        public string SourceName { get; set; }
        public DateTime? DTimCreation { get; set; }
        public DateTime? DTimLastChange { get; set; }
        public string ItemState { get; set; }
    }
}
