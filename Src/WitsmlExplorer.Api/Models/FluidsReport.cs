using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class FluidsReport : ObjectOnWellbore
    {
        public string DTim { get; init; }
        public MeasureWithDatum Md { get; init; }
        public MeasureWithDatum Tvd { get; init; }
        public string NumReport { get; init; }
        public CommonData CommonData { get; init; }
    }
}
