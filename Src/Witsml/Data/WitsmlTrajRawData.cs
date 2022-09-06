using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlTrajRawData
    {
        [XmlElement("gravAxialRaw")] public Measure GravAxialRaw { get; set; }
        [XmlElement("gravTran1Raw")] public Measure GravTran1Raw { get; set; }
        [XmlElement("gravTran2Raw")] public Measure GravTran2Raw { get; set; }
        [XmlElement("magAxialRaw")] public Measure MagAxialRaw { get; set; }
        [XmlElement("magTran1Raw")] public Measure MagTran1Raw { get; set; }
        [XmlElement("magTran2Raw")] public Measure MagTran2Raw { get; set; }
    }
}
