using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data;

public class WitsmlFormationMarker
{
    [XmlAttribute("uidWell")]
    public string UidWell { get; init; }

    [XmlAttribute("uidWellbore")]
    public string UidWellbore { get; init; }

    [XmlAttribute("uid")]
    public string Uid { get; init; }

    [XmlElement("nameWell")]
    public string NameWell { get; init; }

    [XmlElement("nameWellbore")]
    public string NameWellbore { get; init; }

    [XmlElement("name")]
    public string Name { get; init; }

    [XmlElement("description")]
    public string Description { get; init; }

    [XmlElement("tvdTopSample")]
    public WitsmlWellVerticalDepthCoord TvdTopSample { get; init; }

    [XmlElement("mdTopSample")]
    public WitsmlMeasuredDepthCoord MdTopSample { get; init; }

    [XmlElement("commonData")]
    public WitsmlCommonData CommonData { get; init; }
}
