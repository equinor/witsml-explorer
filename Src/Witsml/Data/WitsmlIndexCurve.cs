using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlIndexCurve
    {
        [XmlAttribute("columnIndex")]
        public string ColumnIndex { get; set; }

        [XmlText]
        public string Value { get; set; }
    }
}
