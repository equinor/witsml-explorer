using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlMwdTool
    {
        [XmlElement("flowrateMn")]
        public Measure FlowrateMn { get; set; }


        [XmlElement("flowrateMx")]
        public Measure FlowrateMx { get; set; }


        [XmlElement("tempMx")]
        public Measure TempMx { get; set; }


        [XmlElement("idEquv")]
        public Measure IdEquv { get; set; }


        [XmlElement("sensor")]
        public List<WitsmlSensor> Sensor { get; set; }


        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

    }
}
