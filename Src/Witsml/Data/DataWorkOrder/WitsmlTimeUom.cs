namespace Witsml.Data.DataWorkOrder;
using System.Xml.Serialization;
public enum WitsmlTimeUom
{

    [XmlEnum("s")]
    S,

    [XmlEnum("a")]
    A,

    [XmlEnum("cs")]
    Cs,

    [XmlEnum("d")]
    D,

    [XmlEnum("Ga")]
    Ga,

    [XmlEnum("h")]
    H,

    [XmlEnum("100s")]
    Item100s,

    [XmlEnum("ma")]
    Ma,

    [XmlEnum("min")]
    Min,

    [XmlEnum("ms")]
    Ms,

    [XmlEnum("ms/2")]
    Ms2,

    [XmlEnum("ns")]
    Ns,

    [XmlEnum("ps")]
    Ps,

    [XmlEnum("us")]
    Us,

    [XmlEnum("wk")]
    Wk,

    [XmlEnum("100ka")]
    Item100ka,
}
