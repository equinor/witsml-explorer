using System.Globalization;
using System.Xml;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlMotor
    {
        [XmlElement("offsetTool")]
        public Measure OffsetTool { get; set; }

        [XmlIgnore]
        public double? PresLossFact { get; set; }
        [XmlElement("presLossFact")]
        public string PresLossFactText
        {
            get => PresLossFact?.ToString(CultureInfo.InvariantCulture);
            set => PresLossFact = string.IsNullOrEmpty(value) ? default(double?) : double.Parse(value, CultureInfo.InvariantCulture);
        }

        [XmlElement("flowrateMn")]
        public Measure FlowrateMn { get; set; }

        [XmlElement("flowrateMx")]
        public Measure FlowrateMx { get; set; }

        [XmlElement("diaRotorNozzle")]
        public Measure DiaRotorNozzle { get; set; }

        [XmlElement("clearanceBearBox")]
        public Measure ClearanceBearBox { get; set; }

        [XmlIgnore]
        public int? LobesRotor { get; set; }
        [XmlElement("lobesRotor")]
        public string LobesRotorText
        {
            get => LobesRotor?.ToString(CultureInfo.InvariantCulture);
            set => LobesRotor = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value);
        }

        [XmlIgnore]
        public int? LobesStator { get; set; }
        [XmlElement("lobesStator")]
        public string LobesStatorText
        {
            get => LobesStator?.ToString(CultureInfo.InvariantCulture);
            set => LobesStator = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value);
        }

        [XmlElement("typeBearing")]
        public string TypeBearing { get; set; }

        [XmlElement("tempOpMx")]
        public Measure TempOpMx { get; set; }

        [XmlIgnore]
        public bool? RotorCatcher { get; set; }
        [XmlElement("rotorCatcher")]
        public string RotorCatcherText
        {
            get => RotorCatcher.HasValue ? XmlConvert.ToString(RotorCatcher.Value) : null;
            set => RotorCatcher = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value);
        }

        [XmlIgnore]
        public bool? DumpValve { get; set; }
        [XmlElement("dumpValve")]
        public string DumpValveText
        {
            get => DumpValve.HasValue ? XmlConvert.ToString(DumpValve.Value) : null;
            set => DumpValve = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value);
        }

        [XmlElement("diaNozzle")]
        public Measure DiaNozzle { get; set; }

        [XmlIgnore]
        public bool? Rotatable { get; set; }
        [XmlElement("rotatable")]
        public string RotatableText
        {
            get => Rotatable.HasValue ? XmlConvert.ToString(Rotatable.Value) : null;
            set => Rotatable = string.IsNullOrEmpty(value) ? default(bool?) : bool.Parse(value);
        }

        [XmlElement("bendSettingsMn")]
        public Measure BendSettingsMn { get; set; }

        [XmlElement("bendSettingsMx")]
        public Measure BendSettingsMx { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
