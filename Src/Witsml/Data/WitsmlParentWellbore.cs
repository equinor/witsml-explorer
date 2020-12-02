using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlParentWellbore
    {
        [XmlAttribute("uidRef")]
        public string UidRef { get; set; }

        [XmlText]
        public string Value { get; set; }

    }
}
