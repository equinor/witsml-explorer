namespace Witsml.Data.Curves
{
    public class StringValue : CurveValue
    {
        private string value;

        public StringValue(string value)
        {
            this.value = value;
        }

        public string Get() => value;

        public override string GetAsString() => value;

        public override string ToString() => value;
    }
}
