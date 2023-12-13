using System.Linq;
using System.Text.Json.Serialization;
using System.Xml;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot(ElementName = "customData")]
    public class WitsmlCustomData
    {
        [JsonIgnore]
        [XmlIgnore]
        private XmlElement[] _allElements;

        [JsonIgnore]
        [XmlAnyElement]
        public XmlElement[] AllElements
        {
            get => _allElements;
            set
            {
                _allElements = value;
                // System.Text.Json does not support serializing XML documents so we serialize the contents verbatim for now
                Verbatim = string.Join(string.Empty, value.Select(element => element.OuterXml));
            }
        }

        [XmlIgnore]
        public string Verbatim { get; set; }
    }
}
