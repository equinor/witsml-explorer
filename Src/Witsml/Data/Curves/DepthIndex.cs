#pragma warning disable CS0253
using System;
using System.Globalization;

namespace Witsml.Data.Curves
{
    public class DepthIndex : Index
    {
        private const double OffsetEpsilon = 1e-3;
        private const double Epsilon = 1e-5;
        public const double NullValue = -999.25;

        public double Value { get; }
        public DepthUnit Uom { get; }

        public DepthIndex(double value, DepthUnit uom)
        {
            Uom = uom;
            Value = value;
        }

        public DepthIndex(double value, string uom)
        {
            Uom = DepthUnit.FromString(uom);
            Value = value;
        }

        public DepthIndex(double value)
        {
            Uom = DepthUnit.Meter;
            Value = value;
        }

        public DepthIndex(int value)
        {
            Uom = DepthUnit.Meter;
            Value = value;
        }

        private bool HasSameUnitAs(DepthIndex that) => Uom.Equals(that.Uom);

        [Obsolete("AddEpsilon is deprecated due to assuming 3 decimals of precision for depth indexes. Some WITSML servers do not use 3 decimals.")]
        public override Index AddEpsilon() => new DepthIndex(Value + OffsetEpsilon, Uom);

        private Index Subtract(Index that)
        {
            DepthIndex thatIndex = GetDepthFromIndex(that);
            return HasSameUnitAs(thatIndex) ? new DepthIndex(Value - thatIndex.Value, Uom) : throw new ArgumentException("Cannot subtract depths with different types");
        }

        public override int CompareTo(Index that)
        {
            DepthIndex thatDepthIndex = GetDepthFromIndex(that);
            if (!HasSameUnitAs(thatDepthIndex))
            {
                throw new ArgumentException("Cannot compare depths with different unit types");
            }
            var isEqual = Math.Abs(Value - thatDepthIndex.Value) < Epsilon;
            return isEqual ? 0 : Value.CompareTo(thatDepthIndex.Value);
        }

        private static DepthIndex GetDepthFromIndex(Index index) => (DepthIndex)index;

        public override string GetValueAsString() => Value.ToString(CultureInfo.InvariantCulture);

        public override bool IsContinuous(Index that)
        {
            var difference = (DepthIndex)Subtract(that);
            return Math.Abs(difference.Value) < 0.1;
        }

        public override bool IsNegative() => Value <= 0.0;
        public override bool IsNullValue()
        {
            return Math.Abs(Value - NullValue) < 0;
        }


        public override bool Equals(object that)
        {
            if (this == that) return true;
            if (that == null || GetType() != that.GetType()) return false;

            var depth = (DepthIndex)that;

            if (depth.Value.CompareTo(Value) != 0) return false;
            return Uom?.Equals(depth.Uom) ?? depth.Uom == null;
        }


        public override int GetHashCode()
        {
            return Value.GetHashCode() ^ Uom.GetHashCode();
        }

        public override string ToString() => $"{GetValueAsString()} {Uom}";
        
        public static DepthIndex operator -(DepthIndex index1, DepthIndex index2)
        {
            if (!index1.HasSameUnitAs(index2))
            {
                throw new ArgumentException("Cannot subtract depths with different types");
            }

            return new DepthIndex(index1.Value - index2.Value, index1.Uom);
        }
    }
}
#pragma warning restore CS0253
