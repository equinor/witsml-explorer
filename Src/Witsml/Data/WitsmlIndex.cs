using System.Xml.Serialization;

using Witsml.Data.Curves;

namespace Witsml.Data
{
    public class WitsmlIndex
    {
        [XmlAttribute("uom")]
        public string Uom { get; set; } = string.Empty;

        [XmlText]
        public string Value { get; set; } = string.Empty;

        public WitsmlIndex() { }

        public WitsmlIndex(DepthIndex depthIndex)
        {
            Uom = depthIndex.Uom.ToString();
            Value = depthIndex.GetValueAsString();
        }

        public WitsmlIndex(string value)
        {
            Value = value;
        }

        public override string ToString()
        {
            return $"{Value}{Uom}";
        }
    }
}
