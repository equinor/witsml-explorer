using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlMotor
    {
        [XmlElement("offsetTool")]
        public Measure OffsetTool { get; set; }

        [XmlElement("presLossFact")]
        public double PresLossFact { get; set; }

        [XmlElement("flowrateMn")]
        public Measure FlowrateMn { get; set; }

        [XmlElement("flowrateMx")]
        public Measure FlowrateMx { get; set; }

        [XmlElement("diaRotorNozzle")]
        public Measure DiaRotorNozzle { get; set; }

        [XmlElement("clearanceBearBox")]
        public Measure ClearanceBearBox { get; set; }

        [XmlElement("lobesRotor")]
        public int LobesRotor { get; set; }

        [XmlElement("lobesStator")]
        public int LobesStator { get; set; }

        [XmlElement("typeBearing")]
        public string TypeBearing { get; set; }

        [XmlElement("tempOpMx")]
        public Measure TempOpMx { get; set; }

        [XmlElement("rotorCatcher")]
        public bool RotorCatcher { get; set; }

        [XmlElement("dumpValve")]
        public bool DumpValve { get; set; }

        [XmlElement("diaNozzle")]
        public Measure DiaNozzle { get; set; }

        [XmlElement("rotatable")]
        public bool Rotatable { get; set; }

        [XmlElement("bendSettingsMn")]
        public Measure BendSettingsMn { get; set; }

        [XmlElement("bendSettingsMx")]
        public Measure BendSettingsMx { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
