using System.Globalization;

using Witsml.Data.Measures;

namespace WitsmlExplorer.Api.Models.Measure
{
    public class LengthMeasure : Measure
    {
        public decimal Value { get; set; }

        public WitsmlLengthMeasure ToWitsml()
        {
            return new()
            {
                Uom = Uom,
                Value = Value.ToString(CultureInfo.InvariantCulture)
            };
        }
    }
}
