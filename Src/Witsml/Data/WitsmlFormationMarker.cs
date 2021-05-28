using System.Collections.Generic;
using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlFormationMarker
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

        [XmlElement("description")]
        public string Description { get; set; }

        [XmlElement("tvdTopSample")]
        public WitsmlWellVerticalDepthCoord TvdTopSample { get; set; }

        [XmlElement("mdTopSample")]
        public WitsmlMeasuredDepthCoord MdTopSample { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }
    }
}
