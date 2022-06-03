using System.Xml;
using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlHoleOpener
    {
        [XmlElement("typeHoleOpener")]
        public string TypeHoleOpener { get; set; }

        [XmlIgnore]
        public int? NumCutter { get; set; }
        [XmlElement("numCutter")]
        public string NumCutterText
        {
            get { return NumCutter.HasValue ? XmlConvert.ToString(NumCutter.Value) : null; }
            set { NumCutter = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value); }
        }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("diaHoleOpener")]
        public Measure DiaHoleOpener { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
