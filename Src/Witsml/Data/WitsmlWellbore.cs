using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlWellbore
    {
        [XmlAttribute("uid")] public string Uid { get; set; }
        [XmlElement("nameWell")] public string NameWell { get; set; }
        [XmlElement("name")] public string Name { get; set; }
        [XmlAttribute("uidWell")] public string UidWell { get; set; }
        [XmlElement("parentWellbore")] public WitsmlParentWellbore ParentWellbore { get; set; }
        [XmlElement("statusWellbore")] public string StatusWellbore { get; set; }
        [XmlElement("purposeWellbore")] public string PurposeWellbore { get; set; }
        [XmlElement("typeWellbore")] public string TypeWellbore { get; set; }
        [XmlElement("commonData")] public WitsmlCommonData CommonData { get; set; }
        [XmlElement("isActive")] public string IsActive { get; set; }
    }
}
