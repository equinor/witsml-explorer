using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlStabilizer
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("lenBlade")]
        public Measure LenBlade { get; set; }

        [XmlElement("lenBladeGauge")]
        public Measure LenBladeGauge { get; set; }

        [XmlElement("odBladeMx")]
        public Measure OdBladeMx { get; set; }

        [XmlElement("odBladeMn")]
        public Measure OdBladeMn { get; set; }

        [XmlElement("distBladeBot")]
        public Measure DistBladeBot { get; set; }

        [XmlElement("shapeBlade")]
        public string ShapeBlade { get; set; }

        [XmlElement("factFric")]
        public double FactFric { get; set; }

        [XmlElement("typeBlade")]
        public string TypeBlade { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
