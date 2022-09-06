using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlCost
    {
        [XmlAttribute("currency")]
        public string Currency { get; set; }

        [XmlText]
        public double Value { get; set; }
    }
}
