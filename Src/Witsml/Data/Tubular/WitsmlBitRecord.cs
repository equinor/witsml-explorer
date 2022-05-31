using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlBitRecord
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("numBit")]
        public string NumBit { get; set; }

        [XmlElement("diaBit")]
        public Measure DiaBit { get; set; }

        [XmlElement("diaPassThru")]
        public Measure DiaPassThru { get; set; }

        [XmlElement("diaPilot")]
        public Measure DiaPilot { get; set; }

        [XmlElement("manufacturer")]
        public string Manufacturer { get; set; }

        [XmlElement("typeBit")]
        public string TypeBit { get; set; }

        [XmlElement("cost")]
        public WitsmlCost Cost { get; set; }

        [XmlElement("codeMfg")]
        public string CodeMfg { get; set; }

        [XmlElement("codeIADC")]
        public string CodeIADC { get; set; }

        [XmlElement("condInitInner")]
        public int CondInitInner { get; set; }

        [XmlElement("condInitOuter")]
        public int CondInitOuter { get; set; }

        [XmlElement("condInitDull")]
        public string CondInitDull { get; set; }

        [XmlElement("condInitLocation")]
        public string CondInitLocation { get; set; }

        [XmlElement("condInitBearing")]
        public string CondInitBearing { get; set; }

        [XmlElement("condInitGauge")]
        public string CondInitGauge { get; set; }

        [XmlElement("condInitOther")]
        public string CondInitOther { get; set; }

        [XmlElement("condInitReason")]
        public string CondInitReason { get; set; }

        [XmlElement("condFinalInner")]
        public int CondFinalInner { get; set; }

        [XmlElement("condFinalOuter")]
        public int CondFinalOuter { get; set; }

        [XmlElement("condFinalDull")]
        public string CondFinalDull { get; set; }

        [XmlElement("condFinalLocation")]
        public string CondFinalLocation { get; set; }

        [XmlElement("condFinalBearing")]
        public string CondFinalBearing { get; set; }

        [XmlElement("condFinalGauge")]
        public string CondFinalGauge { get; set; }

        [XmlElement("condFinalOther")]
        public string CondFinalOther { get; set; }

        [XmlElement("condFinalReason")]
        public string CondFinalReason { get; set; }

        [XmlElement("drive")]
        public string Drive { get; set; }

        [XmlElement("bitClass")]
        public string BitClass { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
