using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlMudLogParameter
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("dTime")]
        public string DTime { get; set; }

        [XmlElement("mdTop")]
        public WitsmlMeasureWithDatum MdTop { get; set; }

        [XmlElement("mdBottom")]
        public WitsmlMeasureWithDatum MdBottom { get; set; }

        [XmlElement("force")]
        public Measure Force { get; set; }

        [XmlElement("concentration")]
        public Measure Concentration { get; set; }

        [XmlElement("equivalentMudWeight")]
        public Measure EquivalentMudWeight { get; set; }

        [XmlElement("pressureGradient")]
        public Measure PressureGradient { get; set; }

        [XmlElement("text")]
        public string Text { get; set; }

        [XmlElement("commonTime")]
        public WitsmlCommonTime CommonTime { get; set; }
    }
}
