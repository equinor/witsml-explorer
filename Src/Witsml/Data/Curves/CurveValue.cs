using Witsml.Extensions;

namespace Witsml.Data.Curves
{
    public abstract class CurveValue
    {
        public abstract string GetAsString();

        public static CurveValue From(string input)
        {
            return string.IsNullOrEmpty(input) ? null : input.IsNumeric() ? new DoubleValue(input) : new StringValue(input);
        }
    }
}
