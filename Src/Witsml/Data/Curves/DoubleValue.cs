using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DoubleValue : CurveValue
    {
        private readonly double _value;

        public DoubleValue(double value)
        {
            _value = value;
        }

        public DoubleValue(string value)
        {
            _value = double.Parse(value, CultureInfo.InvariantCulture);
        }

        public double Get()
        {
            return _value;
        }

        public override string GetAsString()
        {
            return _value.ToString(CultureInfo.InvariantCulture);
        }

        public override string ToString()
        {
            return GetAsString();
        }
    }
}
