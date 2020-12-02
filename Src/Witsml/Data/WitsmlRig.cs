using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRig
    {
        [XmlElement("airGap")]
        public string AirGap { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("name")]
        public string Name { get; set; } = "";

        [XmlElement("nameWell")]
        public string NameWell { get; set; } = "";

        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; } = "";

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("typeRig")]
        public string TypeRig { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; } = "";

        [XmlAttribute("uidWell")]
        public string UidWell { get; set; } = "";

        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; } = "";
    }
}
