using System.Globalization;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlNozzle
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlIgnore]
        public int? Index { get; set; }
        [XmlElement("index")]
        public string IndexText
        {
            get => Index?.ToString(CultureInfo.InvariantCulture);
            set => Index = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value);
        }

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
