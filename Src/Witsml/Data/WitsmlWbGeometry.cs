using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlWbGeometry
    {
        [XmlAttribute("uidWell")]
        public string WellUid { get; set; }

        [XmlAttribute("uidWellbore")]
        public string WellboreUid { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("nameWell")]
        public string WellName { get; set; }

        [XmlElement("nameWellbore")]
        public string WellboreName { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("dTimReport")]
        public string DTimReport { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasuredDepthCoord MdBottom { get; set; }

        [XmlElement("gapAir")]
        public WitsmlLengthMeasure GapAir { get; set; }

        [XmlElement("depthWaterMean")]
        public WitsmlLengthMeasure DepthWaterMean { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
