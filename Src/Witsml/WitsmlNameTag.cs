using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlNameTag
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("numberingScheme")]
        public string NumberingScheme { get; set; }

        [XmlElement("technology")]
        public string Technology { get; set; }

        [XmlElement("location")]
        public string Location { get; set; }

        [XmlElement("installationDate")]
        public string InstallationDate { get; set; }

        [XmlElement("installationCompany")]
        public string InstallationCompany { get; set; }

        [XmlElement("mountingCode")]
        public string MountingCode { get; set; }

        [XmlElement("comment")]
        public string Comment { get; set; }
    }
}
