using System.Xml.Serialization;

namespace Witsml.Data.DataWorkOrder;

public enum WitsmlOperationStatus
{

    [XmlEnum("inactive")]
    Inactive,

    [XmlEnum("active")]
    Active,

    [XmlEnum("completed")]
    Completed,
}
