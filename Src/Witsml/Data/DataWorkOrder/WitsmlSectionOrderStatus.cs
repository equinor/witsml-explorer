using System.Xml.Serialization;
namespace Witsml.Data.DataWorkOrder;

public enum WitsmlSectionOrderStatus
{

    [XmlEnum("no ordered curves")]
    NoOrderedCurves,

    [XmlEnum("draft")]
    Draft,

    [XmlEnum("submitted")]
    Submitted,

    [XmlEnum("approved")]
    Approved,
}
