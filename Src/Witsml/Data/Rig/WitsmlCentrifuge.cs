using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Rig
{
    public class WitsmlCentrifuge
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

        [XmlElement("capFlow")]
        public WitsmlFlowRateMeasure CapFlow { get; set; }

        [XmlElement("owner")]
        public string Owner { get; set; }

        [XmlElement("nameTag")]
        public List<WitsmlNameTag> NameTag { get; set; }
    }
}
