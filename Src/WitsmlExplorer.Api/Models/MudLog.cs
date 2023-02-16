using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class MudLog : ObjectOnWellbore
    {
        public bool ObjectGrowing { get; set; }
        public string MudLogCompany { get; set; }
        public string MudLogEngineers { get; set; }
        public MeasureWithDatum StartMd { get; set; }
        public MeasureWithDatum EndMd { get; set; }
        public List<MudLogGeologyInterval> GeologyInterval { get; set; }
        public CommonData CommonData { get; set; }
    }
}
