using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlAxisDefinition
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("order")]
        public int Order { get; set; }

        [XmlElement("count")]
        public int Count { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("propertyType")]
        public string PropertyType { get; set; }

        [XmlElement("uom")]
        public string Uom { get; set; }

        [XmlElement("doubleValues")]
        public string DoubleValues { get; set; }

        [XmlElement("stringValues")]
        public string StringValues { get; set; }

    }
}
