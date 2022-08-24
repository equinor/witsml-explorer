namespace Witsml.Data.Curves
{
    public class StringValue : CurveValue
    {
        private readonly string _value;

        public StringValue(string value)
        {
            _value = value;
        }

        public string Get() => _value;

        public override string GetAsString() => _value;

        public override string ToString() => _value;
    }
}
