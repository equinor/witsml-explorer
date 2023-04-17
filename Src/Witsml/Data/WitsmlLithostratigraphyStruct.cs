using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlLithostratigraphyStruct
    {
        [XmlAttribute("kind")]
        public string Kind { get; set; }

        [XmlText]
        public string Value { get; set; }
    }
}
