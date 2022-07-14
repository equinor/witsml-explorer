using System;
using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class BhaRun
    {
        public string Uid { get; set; }
        public string Name { get; set; }
        public string WellUid { get; set; }
        public string WellName { get; set; }
        public string WellboreName { get; set; }
        public string WellboreUid { get; set; }
        public string NumStringRun { get; set; }
        public DateTime? DTimStart { get; set; }
        public DateTime? DTimStop { get; set; }
        public CommonData CommonData { get; set; }

    }
}
