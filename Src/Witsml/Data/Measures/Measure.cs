using System.Xml.Serialization;

namespace Witsml.Data.Measures
{
    public class Measure
    {
        [XmlAttribute("uom")] public string Uom { get; set; }
        [XmlText] public string Value { get; set; }
    }
}
