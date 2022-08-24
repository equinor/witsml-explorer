using System;

namespace Witsml.Data.Curves
{
    public class DepthUnit : Unit
    {
        public static readonly DepthUnit Meter = new("m");
        public static readonly DepthUnit Feet = new("ft");

        public DepthUnit(string unitCode) : base(unitCode) { }

        public static DepthUnit FromString(string unitCode)
        {
            return "m".Equals(unitCode, StringComparison.InvariantCulture)
                ? Meter
                : ("ft".Equals(unitCode, StringComparison.InvariantCulture)
                ? Feet
                : throw new ArgumentException($"Unit \"{unitCode}\" is not supported!"));
        }
    }
}
