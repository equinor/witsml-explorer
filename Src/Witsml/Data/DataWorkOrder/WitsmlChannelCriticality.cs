using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public enum WitsmlChannelCriticality
{

    [XmlEnum("normal")]
    Normal,

    [XmlEnum("high")]
    High
}
