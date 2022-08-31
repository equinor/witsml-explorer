using System.Globalization;

namespace WitsmlExplorer.Api.Models.Measure
{
    public class MeasureWithDatum : Measure
    {
        public double Value { get; set; }
        public string Datum { get; set; }

        public Witsml.Data.Measures.WitsmlMeasureWithDatum ToWitsml()
        {
            return new()
            {
                Uom = Uom,
                Value = Value.ToString(CultureInfo.InvariantCulture),
                Datum = Datum
            };
        }
    }
}
