using System.Xml.Serialization;
namespace Witsml.Data.DataWorkOrder;

public enum WitsmlSectionOrderStatus
{

    [XmlEnum("no ordered curves")]
    NoOrderedcurves,

    [XmlEnum("draft")]
    Draft,

    [XmlEnum("submitted")]
    Submitted,

    [XmlEnum("approved")]
    Approved,
}
