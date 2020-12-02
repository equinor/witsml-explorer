using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlExtensionValue
    {
        [XmlAttribute("uom")]
        public string Uom { get; set; } = "";

        [XmlText]
        public string Value { get; set; } = "";
    }
}
