using System.Collections.Generic;
using System.Xml;
using System.Xml.Serialization;
using Witsml.Data.Measures;
using System.Globalization;

namespace Witsml.Data.Tubular
{
    public class WitsmlRotarySteerableTool
    {
        [XmlElement("deflectionMethod")]
        public string DeflectionMethod { get; set; }

        [XmlElement("bendAngle")]
        public Measure BendAngle { get; set; }

        [XmlElement("bendOffset")]
        public Measure BendOffset { get; set; }

        [XmlElement("holeSizeMn")]
        public Measure HoleSizeMn { get; set; }

        [XmlElement("holeSizeMx")]
        public Measure HoleSizeMx { get; set; }

        [XmlElement("wobMx")]
        public Measure WobMx { get; set; }

        [XmlElement("operatingSpeed")]
        public Measure OperatingSpeed { get; set; }

        [XmlElement("speedMx")]
        public Measure SpeedMx { get; set; }

        [XmlElement("flowRateMn")]
        public Measure FlowRateMn { get; set; }

        [XmlElement("flowRateMx")]
        public Measure FlowRateMx { get; set; }

        [XmlElement("downLinkFlowRateMn")]
        public Measure DownLinkFlowRateMn { get; set; }

        [XmlElement("downLinkFlowRateMx")]
        public Measure DownLinkFlowRateMx { get; set; }

        [XmlIgnore]
        public double? PressLossFact { get; set; }
        [XmlElement("pressLossFact")]
        public string PressLossFactText
        {
            get { return PressLossFact.HasValue ? XmlConvert.ToString(PressLossFact.Value) : null; }
            set { PressLossFact = string.IsNullOrEmpty(value) ? default(double?) : double.Parse(value, CultureInfo.InvariantCulture); }
        }

        [XmlIgnore]
        public int? PadCount { get; set; }
        [XmlElement("padCount")]
        public string PadCountText
        {
            get { return PadCount.HasValue ? XmlConvert.ToString(PadCount.Value) : null; }
            set { PadCount = string.IsNullOrEmpty(value) ? default(int?) : int.Parse(value); }
        }

        [XmlElement("padLen")]
        public Measure PadLen { get; set; }

        [XmlElement("padWidth")]
        public Measure PadWidth { get; set; }

        [XmlElement("padOffset")]
        public Measure PadOffset { get; set; }

        [XmlElement("openPadOd")]
        public Measure OpenPadOd { get; set; }

        [XmlElement("closePadOd")]
        public Measure ClosePadOd { get; set; }

        [XmlElement("sensor")]
        public List<WitsmlSensor> Sensor { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }
    }
}
