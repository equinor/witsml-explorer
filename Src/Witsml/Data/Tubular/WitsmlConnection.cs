using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlConnection
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("id")]
        public Measure Id { get; set; }

        [XmlElement("od")]
        public Measure Od { get; set; }

        [XmlElement("len")]
        public Measure Len { get; set; }

        [XmlElement("typeThread")]
        public string TypeThread { get; set; }

        [XmlElement("sizeThread")]
        public Measure SizeThread { get; set; }

        [XmlElement("tensYield")]
        public Measure TensYield { get; set; }

        [XmlElement("tqYield")]
        public Measure TqYield { get; set; }

        [XmlElement("position")]
        public string Position { get; set; }

        [XmlElement("criticalCrossSection")]
        public Measure CriticalCrossSection { get; set; }

        [XmlElement("presLeak")]
        public Measure PresLeak { get; set; }

        [XmlElement("tqMakeup")]
        public Measure TqMakeup { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
