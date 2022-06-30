using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRisk
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
        [XmlElement("type")]
        public string Type { get; set; }
        [XmlElement("category")]
        public string Category { get; set; }
        [XmlElement("subCategory")]
        public string SubCategory { get; set; }
        [XmlElement("extendCategory")]
        public string ExtendCategory { get; set; }
        [XmlElement("affectedPersonnel")]
        public string AffectedPersonnel { get; set; }
        [XmlElement("dTimStart")]
        public string DTimStart { get; set; }
        [XmlElement("dTimEnd")]
        public string DTimEnd { get; set; }
        public WitsmlIndex MdBitStart { get; set; }
        [XmlElement("mdBitEnd")]
        public WitsmlIndex MdBitEnd { get; set; }

        [XmlElement("severityLevel")]
        public string SeverityLevel { get; set; }
        [XmlElement("probabilityLevel")]
        public string ProbabilityLevel { get; set; }
        [XmlElement("summary")]
        public string Summary { get; set; }
        [XmlElement("details")]
        public string Details { get; set; }

        [XmlElement("commonData")]
        public WitsmlCommonData CommonData { get; set; }

    }
}
