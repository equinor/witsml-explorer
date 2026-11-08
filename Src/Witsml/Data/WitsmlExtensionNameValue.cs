using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlExtensionNameValue
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("name")]
        public string Name { get; set; }

        [XmlElement("value")]
        public WitsmlExtensionValue Value { get; set; }

        [XmlElement("dataType")]
        public string DataType { get; set; }

        [XmlElement("dTim")]
        public string DTim { get; set; }

        [XmlElement("md")]
        public WitsmlMeasuredDepthCoord Md { get; set; }

        [XmlElement("index")]
        public string Index { get; set; }

        [XmlElement("measureClass")]
        public string MeasureClass { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }
    }
}
