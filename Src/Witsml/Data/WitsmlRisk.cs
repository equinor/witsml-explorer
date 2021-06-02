using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRisk
    {
        [XmlAttribute("uidWell")] public string UidWell { get; set; }
        [XmlAttribute("uidWellbore")] public string UidWellbore { get; set; }
        [XmlAttribute("uid")] public string Uid { get; set; }

        [XmlElement("name")] public string Name { get; set; }
        [XmlElement("nameWell")] public string NameWell { get; set; }
        [XmlElement("nameWellbore")] public string NameWellbore { get; set; }

        [XmlElement("type")] public string Type { get; set; }
        [XmlElement("category")] public string Category { get; set; }
        [XmlElement("subCategory")] public string SubCategory { get; set; }
        [XmlElement("extendCategory")] public string ExtendCategory { get; set; }
        [XmlElement("dTimStart")] public string DTimStart { get; set; }
        [XmlElement("dTimEnd")] public string DTimEnd { get; set; }
        [XmlElement("mdBitStart")] public string MdBitStart { get; set; }
        [XmlElement("mdBitEnd")] public string MdBitEnd { get; set; }
        [XmlElement("severityLevel")] public string SeverityLevel { get; set; }
        [XmlElement("summary")] public string Summary { get; set; }
        [XmlElement("details")] public string Details { get; set; }

        [XmlElement("commonData")] public WitsmlCommonData CommonData { get; set; }
    }
}
