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
        public string Country { get; set;  }
    }
}
