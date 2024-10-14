using System.Globalization;

using Witsml.Data.Measures;

namespace WitsmlExplorer.Api.Models.Measure
{
    public class DayMeasure : Measure
    {
        public int Value { get; init; }

        public WitsmlDayMeasure ToWitsml()
        {
            return new()
            {
                Uom = Uom,
                Value = Value.ToString(CultureInfo.InvariantCulture)
            };
        }
    }
}
