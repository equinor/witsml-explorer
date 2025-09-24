namespace Witsml.Data.DataWorkOrder;
using System.Xml.Serialization;
public enum WitsmlLogIndexType
{

    [XmlEnum("date time")]
    DateTime,

    [XmlEnum("elapsed time")]
    ElapsedTime,

    [XmlEnum("lenght")]
    Length,

    [XmlEnum("measured depth")]
    MeasuredDepth,

    [XmlEnum("vertical depth")]
    VerticalDepth,

    [XmlEnum("other")]
    Other,

    [XmlEnum("unknown")]
    Unknown,
}
