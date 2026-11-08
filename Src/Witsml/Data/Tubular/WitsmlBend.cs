using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.Tubular
{
    public class WitsmlBend
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("angle")]
        public Measure Angle { get; set; }

        [XmlElement("distBendBot")]
        public Measure DistBendBot { get; set; }

        [XmlElement("customData")]
        public WitsmlCustomData CustomData { get; set; }

        [XmlElement("extensionAny")]
        public WitsmlCustomData ExtensionAny { get; set; }

        [XmlElement("extensionNameValue")]
        public List<WitsmlExtensionNameValue> ExtensionNameValues { get; set; }
    }
}
