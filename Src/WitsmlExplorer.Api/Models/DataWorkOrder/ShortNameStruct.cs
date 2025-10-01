using Witsml.Data.DataWorkOrder;

namespace WitsmlExplorer.Api.Models.DataWorkOrder;

public class ShortNameStruct
{
    public string NamingSystem { get; set; }
    public string Value { get; set; }

    public WitsmlShortNameStruct ToWitsml()
    {
        return new()
        {
            NamingSystem = NamingSystem,
            Value = Value
        };
    }
}
