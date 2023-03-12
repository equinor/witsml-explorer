using System.Globalization;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models.Measure
{
    public class MeasureWithDatum : Measure
    {
        public double Value { get; set; }
        public string Datum { get; set; }

        public T ToWitsml<T>() where T : Witsml.Data.Measures.WitsmlMeasureWithDatum, new()
        {
            return new()
            {
                Uom = Uom,
                Value = Value.ToString(CultureInfo.InvariantCulture),
                Datum = Datum
            };
        }

        public static T ToEmptyWitsml<T>() where T : Witsml.Data.Measures.WitsmlMeasureWithDatum, new()
        {
            return new()
            {
                Uom = "",
                Value = "",
                Datum = ""
            };
        }

        public static MeasureWithDatum FromWitsml(Witsml.Data.Measures.WitsmlMeasureWithDatum witsmlMeasure)
        {
            if (witsmlMeasure == null || string.IsNullOrEmpty(witsmlMeasure.Value))
            {
                return null;
            }
            return new()
            {
                Uom = witsmlMeasure.Uom,
                Value = StringHelpers.ToDouble(witsmlMeasure.Value),
                Datum = witsmlMeasure.Datum,
            };
        }

    }
}
