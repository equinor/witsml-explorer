using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlNozzle
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("index")]
        public int Index { get; set; }

        [XmlElement("diaNozzle")]
        public Measure DiaNozzle { get; set; }

        [XmlElement("typeNozzle")]
        public string TypeNozzle { get; set; }

        [XmlElement("len")]
        public Measure Len { get; set; }

        [XmlElement("orientation")]
        public string Orientation { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
