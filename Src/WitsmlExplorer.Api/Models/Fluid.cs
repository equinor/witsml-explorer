using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class Fluid
    {
        public string Uid { get; set; }
        public string Type { get; set; }
        public string LocationSample { get; set; }
        public string DTim { get; set; }
        public MeasureWithDatum Md { get; set; }
        public MeasureWithDatum Tvd { get; set; }
        public List<Rheometer> Rheometers { get; set; }
    }
}
