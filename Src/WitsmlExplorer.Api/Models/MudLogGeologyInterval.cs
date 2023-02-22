using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogGeologyInterval
    {
        public string Uid { get; set; }
        public string TypeLithology { get; set; }
        public MeasureWithDatum MdTop { get; set; }
        public MeasureWithDatum MdBottom { get; set; }
        public MeasureWithDatum TvdTop { get; set; }
        public MeasureWithDatum TvdBase { get; set; }
        public LengthMeasure RopAv { get; set; }
        public LengthMeasure WobAv { get; set; }
        public LengthMeasure TqAv { get; set; }
        public LengthMeasure CurrentAv { get; set; }
        public LengthMeasure RpmAv { get; set; }
        public LengthMeasure WtMudAv { get; set; }
        public LengthMeasure EcdTdAv { get; set; }
        public string DxcAv { get; set; }
        public List<MudLogLithology> Lithologies { get; set; }
        public string Description { get; set; }
        public CommonTime CommonTime { get; set; }
    }
}
