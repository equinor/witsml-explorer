using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometrySection
    {
        public string Uid { get; init; }
        public string TypeHoleCasing { get; init; }
        public MeasureWithDatum MdTop { get; init; }
        public MeasureWithDatum MdBottom { get; init; }
        public MeasureWithDatum TvdTop { get; init; }
        public MeasureWithDatum TvdBottom { get; init; }
        public LengthMeasure IdSection { get; init; }
        public LengthMeasure OdSection { get; init; }
        public LengthMeasure WtPerLen { get; init; }
        public string Grade { get; init; }
        public bool? CurveConductor { get; init; }
        public LengthMeasure DiaDrift { get; init; }
        public double? FactFric { get; init; }

    }
}
