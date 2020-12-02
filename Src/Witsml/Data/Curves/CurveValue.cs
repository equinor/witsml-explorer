using Witsml.Extensions;

namespace Witsml.Data.Curves
{
    public abstract class CurveValue
    {
        public abstract string GetAsString();

        public static CurveValue From(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }

            if (input.IsNumeric())
            {
                return new DoubleValue(input);
            }

            return new StringValue(input);
        }
    }
}
