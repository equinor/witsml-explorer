using System.Xml;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlCustomData
    {
        [XmlAnyElement]
        public XmlElement[] AllElements { get; set; }
    }
}
