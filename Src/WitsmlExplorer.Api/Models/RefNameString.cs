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

        public static RefNameString FromWitsmlRefNameString(Witsml.Data.WitsmlRefNameString witsmlRefNameString)
        {
            return witsmlRefNameString == null ?
                null :
                new RefNameString
                {
                    UidRef = witsmlRefNameString.UidRef,
                    Value = witsmlRefNameString.Value
                };
        }
    }
}
