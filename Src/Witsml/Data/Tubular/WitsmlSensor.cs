using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlSensor
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("typeMeasurement")]
        public string TypeMeasurement { get; set; }

        [XmlElement("offsetBot")]
        public Measure OffsetBot { get; set; }

        [XmlElement("comments")]
        public string Comments { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

        [XmlElement("extensionAny")]
        public WitsmlCustomData ExtensionAny { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
    }
}
