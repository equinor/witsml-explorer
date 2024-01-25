namespace Witsml.Data.Curves
{
    public class Unit
    {
        private readonly string _unitCode;

        public static readonly Unit TimeUnit = new(CommonConstants.Unit.Second);

        public Unit(string unitCode)
        {
            this._unitCode = unitCode;
        }

        public override bool Equals(object obj)
        {
            if (this == obj) return true;
            if (obj == null || GetType() != obj.GetType()) return false;

            var other = (Unit)obj;
            return _unitCode?.Equals(other._unitCode) ?? other._unitCode == null;
        }

        public override int GetHashCode()
        {
            return _unitCode != null ? _unitCode.GetHashCode() : 0;
        }

        public override string ToString() => _unitCode;
    }
}
