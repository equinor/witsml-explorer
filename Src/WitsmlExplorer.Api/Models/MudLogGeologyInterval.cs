using System.Collections.Generic;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class MudLogGeologyInterval
    {
        public string Uid { get; init; }
        public string TypeLithology { get; init; }
        public MeasureWithDatum MdTop { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public MeasureWithDatum TvdTop { get; init; }
        public MeasureWithDatum TvdBase { get; init; }
        public LengthMeasure RopAv { get; init; }
        public LengthMeasure WobAv { get; init; }
        public LengthMeasure TqAv { get; init; }
        public LengthMeasure CurrentAv { get; init; }
        public LengthMeasure RpmAv { get; init; }
        public LengthMeasure WtMudAv { get; init; }
        public LengthMeasure EcdTdAv { get; init; }
        public string DxcAv { get; init; }
        public List<MudLogLithology> Lithologies { get; init; }
        public string Description { get; init; }
        public CommonTime CommonTime { get; init; }
    }
}
