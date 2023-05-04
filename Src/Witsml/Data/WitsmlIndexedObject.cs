using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlIndexedObject
    {

        [XmlText]
        public string Value { get; set; }

        [XmlAttribute("index")]
        public string Index { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }

        [XmlAttribute("uom")]
        public string Uom { get; set; }

        [XmlAttribute("description")]
        public string Description { get; set; }

        [XmlAttribute("uid")]
        public string Uid { get; set; }
    }
}
