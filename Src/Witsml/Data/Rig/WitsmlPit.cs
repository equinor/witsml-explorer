using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlPit
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("index")]
        public string Index { get; set; }

        [XmlElement("dTimInstall")]
        public string DTimInstall { get; set; }

        [XmlElement("dTimRemove")]
        public string DTimRemove { get; set; }

        [XmlElement("capMx")]
        public WitsmlVolumeMeasure CapMx { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("typePit")]
        public string TypePit { get; set; }

        [XmlElement("isActive")]
        public string IsActive { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
