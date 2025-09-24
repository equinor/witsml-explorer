using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public class WitsmlShortNameStruct
{
    [XmlElement("namingSystem")]
    public string NamingSystem { get; set; }

    [XmlElement("value")]
    public string Value { get; set; }
}
