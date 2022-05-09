using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DoubleValue : CurveValue
    {
        private double value;

        public DoubleValue(double value)
        {
            this.value = value;
        }

        public DoubleValue(string value)
        {
            this.value = double.Parse(value, CultureInfo.InvariantCulture);
        }

        public double Get() => value;

        public override string GetAsString() => value.ToString(CultureInfo.InvariantCulture);

        public override string ToString() => GetAsString();
    }
}
