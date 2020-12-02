using System;

namespace Witsml.Data.Curves
{
    public class DepthUnit : Unit
    {
        public static readonly DepthUnit Meter = new DepthUnit("m");
        public static readonly DepthUnit Feet = new DepthUnit("ft");

        public DepthUnit(string unitCode) : base(unitCode) { }

        public static DepthUnit FromString(string unitCode)
        {
            if ("m".Equals(unitCode, StringComparison.InvariantCulture))
            {
                return Meter;
            }
            if ("ft".Equals(unitCode, StringComparison.InvariantCulture))
            {
                return Feet;
            }

            throw new ArgumentException($"Unit \"{unitCode}\" is not supported!");
        }
    }
}
