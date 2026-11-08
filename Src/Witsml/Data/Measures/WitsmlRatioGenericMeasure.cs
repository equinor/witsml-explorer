using System.Xml.Serialization;

namespace Witsml.Data.Measures
{
    public class WitsmlRatioGenericMeasure : Measure
    {
        [XmlAttribute("numerator")]
        public string Numerator { get; set; }

        [XmlAttribute("denominator")]
        public string Denominator { get; set; }
    }
}
