using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class RefNameString
    {
        public string UidRef { get; set; }
        public string Value { get; set; }

        public WitsmlRefNameString ToWitsml()
        {
            return new()
            {
                UidRef = UidRef,
                Value = Value
            };
        }
    }
}
