using System;
using System.Linq;

namespace Witsml.Data.Curves
{
    public class Point
    {
        public Index Index { get; }
        public CurveValue Value { get; }

        public Point(string commaSeparated)
        {
            var values = commaSeparated.Split(",");
            if (DateTimeIndex.TryParseISODate(values.First(), out var witsmlDateTime))
            {
                Index = witsmlDateTime;
            }
            else
            {
                Index = new DepthIndex(double.Parse(values.First()));
            }

            Value = CurveValue.From(values[1]);
        }

        public string GetValueAsString() => Value.GetAsString();

        public int GetValueAsInt()
        {
            if (Value is DoubleValue value)
            {
                return (int) value.Get();
            }
            throw new InvalidCastException("Unable to cast String values to integers");
        }

        public double GetValueAsDouble()
        {
            if (Value is DoubleValue value)
            {
                return value.Get();
            }
            throw new InvalidCastException("Unable to cast String values to double");
        }
    }
}
