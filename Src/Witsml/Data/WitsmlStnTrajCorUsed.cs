using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlStnTrajCorUsed
    {
        [XmlElement("gravAxialAccelCor")] public Measure GravAxialAccelCor { get; set; }
        [XmlElement("gravTran1AccelCor")] public Measure GravTran1AccelCor { get; set; }
        [XmlElement("gravTran2AccelCor")] public Measure GravTran2AccelCor { get; set; }
        [XmlElement("magAxialDrlstrCor")] public Measure MagAxialDrlstrCor { get; set; }
        [XmlElement("magTran1DrlstrCor")] public Measure MagTran1DrlstrCor { get; set; }
        [XmlElement("magTran2DrlstrCor")] public Measure MagTran2DrlstrCor { get; set; }
        [XmlElement("magTran1MSACor")] public Measure MagTran1MsaCor { get; set; }
        [XmlElement("magTran2MSACor")] public Measure MagTran2MsaCor { get; set; }
        [XmlElement("magAxialMSACor")] public Measure MagAxialMsaCor { get; set; }
        [XmlElement("sagIncCor")] public Measure SagIncCor { get; set; }
        [XmlElement("sagAziCor")] public Measure SagAziCor { get; set; }
        [XmlElement("stnMagDeclUsed")] public Measure StnMagDeclUsed { get; set; }
        [XmlElement("stnGridCorUsed")] public Measure StnGridCorUsed { get; set; }
        [XmlElement("stnGridConUsed")] public Measure StnGridConUsed { get; set; }
        [XmlElement("dirSensorOffset")] public Measure DirSensorOffset { get; set; }
    }
}
