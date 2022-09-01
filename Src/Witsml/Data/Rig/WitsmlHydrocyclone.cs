using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data.Rig
{
    public class WitsmlHydrocyclone
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("model")]
        public string Model { get; set; }

        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }

        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("descCone")]
        public string DescCone { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
