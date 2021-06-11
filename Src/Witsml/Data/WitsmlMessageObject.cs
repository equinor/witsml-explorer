using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlMessageObject
    {
        [XmlAttribute("uidWell")] public string UidWell { get; set; }
        [XmlAttribute("uidWellbore")] public string UidWellbore { get; set; }
        [XmlAttribute("uid")] public string Uid { get; set; }

        [XmlElement("nameWell")] public string NameWell { get; set; }
        [XmlElement("nameWellbore")] public string NameWellbore { get; set; }
        [XmlElement("name")] public string Name { get; set; }
        [XmlElement("messageText")] public string MessageText { get; set; }

        //# Required
        [XmlElement("objectReference")] public WitsmlObjectReference ObjectReference { get; set; }

        [XmlElement("commonData")] public WitsmlCommonData CommonData { get; set; }
    }
}
