using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlExtensionValue
    {
        [XmlAttribute("uom")]
        public string Uom { get; set; } = string.Empty;

        [XmlText]
        public string Value { get; set; } = string.Empty;
    }
}
