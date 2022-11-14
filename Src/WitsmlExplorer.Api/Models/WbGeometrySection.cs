using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Models
{
    public class WbGeometrySection
    {
        public string Uid { get; set; }
        public string TypeHoleCasing { get; set; }
        public MeasureWithDatum MdTop { get; set; }
        public MeasureWithDatum MdBottom { get; set; }
        public MeasureWithDatum TvdTop { get; set; }
        public MeasureWithDatum TvdBottom { get; set; }
        public LengthMeasure IdSection { get; set; }
        public LengthMeasure OdSection { get; set; }
        public LengthMeasure WtPerLen { get; set; }
        public string Grade { get; set; }
        public bool? CurveConductor { get; set; }
        public LengthMeasure DiaDrift { get; set; }
        public double? FactFric { get; set; }

    }
}
