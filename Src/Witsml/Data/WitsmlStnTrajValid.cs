using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlStnTrajValid
    {
        [XmlElement("magTotalFieldCalc")] public Measure MagTotalFieldCalc { get; set; }
        [XmlElement("magDipAngleCalc")] public Measure MagDipAngleCalc { get; set; }
        [XmlElement("gravTotalFieldCalc")] public Measure GravTotalFieldCalc { get; set; }
    }
}
