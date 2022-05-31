using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlHoleOpener
    {
        [XmlElement("typeHoleOpener")]
        public string TypeHoleOpener { get; set; }

        [XmlElement("numCutter")]
        public int NumCutter { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("diaHoleOpener")]
        public Measure DiaHoleOpener { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
