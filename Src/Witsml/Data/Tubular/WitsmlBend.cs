using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlBend
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("angle")]
        public Measure Angle { get; set; }

        [XmlElement("distBendBot")]
        public Measure DistBendBot { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
