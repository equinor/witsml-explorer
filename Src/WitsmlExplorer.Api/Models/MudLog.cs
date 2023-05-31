using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class MudLog : ObjectOnWellbore
    {
        public bool ObjectGrowing { get; init; }
        public string MudLogCompany { get; init; }
        public string MudLogEngineers { get; init; }
        public MeasureWithDatum StartMd { get; init; }
        public MeasureWithDatum EndMd { get; init; }
        public List<MudLogGeologyInterval> GeologyInterval { get; set; }
        public CommonData CommonData { get; init; }
    }
}
