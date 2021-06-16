using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlObjectReference
    {
        [XmlAttribute("object")]
        public string Object { get; set; }

        [XmlAttribute("uidRef")]
        public string UidRef { get; set; }

        [XmlText]
        public string Value { get; set; }

        public WitsmlObjectReference() { }

        public WitsmlObjectReference(string obj, string uidRef)
        {
            Object = obj;
            UidRef = uidRef;
        }

        public override string ToString()
        {
            return $"{Object}{UidRef}";
        }
    }
}
