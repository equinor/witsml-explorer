using System;

namespace Witsml.Data.Curves
{
    public class DepthUnit : Unit
    {
        public static readonly DepthUnit Meter = new(CommonConstants.Unit.Meter);
        public static readonly DepthUnit Feet = new(CommonConstants.Unit.Feet);

        public DepthUnit(string unitCode) : base(unitCode) { }

        public static DepthUnit FromString(string unitCode)
        {
            return CommonConstants.Unit.Meter.Equals(unitCode, StringComparison.InvariantCulture)
                ? Meter
                : (CommonConstants.Unit.Feet.Equals(unitCode, StringComparison.InvariantCulture)
                ? Feet
                : throw new ArgumentException($"Unit \"{unitCode}\" is not supported!"));
        }
    }
}
