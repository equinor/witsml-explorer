using System.Globalization;

using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Models.Measure
{
    public class PlaneAngleMeasure : Measure
    {
        public decimal Value { get; set; }

        public T ToWitsml<T>() where T : Witsml.Data.Measures.Measure, new()
        {
            return new()
            {
                Uom = Uom,
                Value = Value.ToString(CultureInfo.InvariantCulture)
            };
        }

        public static PlaneAngleMeasure FromWitsml(Witsml.Data.Measures.Measure witsmlMeasure)
        {
            if (witsmlMeasure == null || string.IsNullOrEmpty(witsmlMeasure.Value))
            {
                return null;
            }
            return new()
            {
                Uom = witsmlMeasure.Uom,
                Value = StringHelpers.ToDecimal(witsmlMeasure.Value)
            };
        }

    }
}
