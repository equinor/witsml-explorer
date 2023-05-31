using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class FluidsReport : ObjectOnWellbore
    {
        public string DTim { get; init; }
        public MeasureWithDatum Md { get; init; }
        public MeasureWithDatum Tvd { get; init; }
        public string NumReport { get; init; }
        public List<Fluid> Fluids { get; set; }
        public CommonData CommonData { get; init; }
    }
}
