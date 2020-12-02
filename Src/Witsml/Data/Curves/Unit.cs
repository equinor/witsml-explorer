namespace Witsml.Data.Curves
{
    public class Unit
    {
        private readonly string unitCode;

        public static Unit NoUnit = new Unit("");
        public static Unit TimeUnit = new Unit("s");

        public Unit(string unitCode)
        {
            this.unitCode = unitCode;
        }

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;

            var other = (Unit) obj;
            return unitCode?.Equals(other.unitCode) ?? other.unitCode == null;
        }

        public override int GetHashCode()
        {
            return unitCode != null ? unitCode.GetHashCode() : 0;
        }

        public override string ToString() => unitCode;
    }
}
