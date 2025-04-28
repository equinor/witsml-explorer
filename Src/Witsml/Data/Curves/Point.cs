using System;
using System.Globalization;
using System.Linq;

namespace Witsml.Data.Curves
{
    public class Point
    {
        public Index Index { get; }
        public CurveValue Value { get; }

        public Point(string commaSeparated)
        {
            string[] values = commaSeparated.Split(CommonConstants.DataSeparator);
            Index = DateTimeIndex.TryParseISODate(values.First(), out DateTimeIndex witsmlDateTime)
                ? witsmlDateTime
                : new DepthIndex(double.Parse(values.First(), CultureInfo.InvariantCulture));

            Value = CurveValue.From(values.Length > 1 ? values[1] : null);
        }

        public string GetValueAsString()
        {
            return Value.GetAsString();
        }

        public int GetValueAsInt()
        {
            return Value is DoubleValue value
                ? (int)value.Get()
                : throw new InvalidCastException(
                    "Unable to cast String values to integers");
        }

        public double GetValueAsDouble()
        {
            return Value is DoubleValue value ? value.Get() : throw new InvalidCastException("Unable to cast String values to double");
        }
    }
}
