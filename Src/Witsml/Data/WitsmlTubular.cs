using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlTubular
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

        [XmlElement("typeTubularAssy")]
        public string TypeTubularAssy { get; set; }

        [XmlElement("tubularComponent")]
        public List<WitsmlTubularComponent> TubularComponents { get; set; }
    }
}
