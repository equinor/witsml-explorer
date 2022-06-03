using System.Text.Json.Serialization;
using System.Xml;
using System.Xml.Serialization;
using System.Linq;

namespace Witsml.Data
{
    [XmlRoot(ElementName = "customData")]
    public class WitsmlCustomData
    {
        [JsonIgnore]
        [XmlIgnore]
        private XmlElement[] _AllElements;

        [JsonIgnore]
        [XmlAnyElement]
        public XmlElement[] AllElements
        {
            get { return _AllElements; }
            set
            {
                _AllElements = value;
                // System.Text.Json does not support serializing XML documents so we serialize the contents verbatim for now
                Verbatim = string.Join("", value.Select(element => element.OuterXml));
            }
        }

        [XmlIgnore]
        public string Verbatim { get; set; }
    }
}
