using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlBhaRun
    {
        [XmlAttribute("uidWell")]
        public string UidWell { get; set; }

        [XmlAttribute("uidWellbore")]
        public string UidWellbore { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("nameWell")]
        public string NameWell { get; set; }

        [XmlElement("nameWellbore")]
        public string NameWellbore { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("tubular")]
        public WitsmlObjectReference Tubular { get; set; }

        [XmlElement("dTimStart")]
        public string DTimStart { get; set; }

        [XmlElement("dTimStop")]
        public string DTimStop { get; set; }

        [XmlElement("numStringRun")]
        public string NumStringRun { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
