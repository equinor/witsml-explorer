using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlJar
    {
        [XmlElement("forUpSet")]
        public Measure ForUpSet { get; set; }

        [XmlElement("forDownSet")]
        public Measure ForDownSet { get; set; }

        [XmlElement("forUpTrip")]
        public Measure ForUpTrip { get; set; }

        [XmlElement("forDownTrip")]
        public Measure ForDownTrip { get; set; }

        [XmlElement("forPmpOpen")]
        public Measure ForPmpOpen { get; set; }

        [XmlElement("forSealFric")]
        public Measure ForSealFric { get; set; }

        [XmlElement("typeJar")]
        public string TypeJar { get; set; }

        [XmlElement("jarAction")]
        public string JarAction { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
