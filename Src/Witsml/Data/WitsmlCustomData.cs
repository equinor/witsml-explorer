using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot]
    public class WitsmlCustomData
    {
        [XmlElement("lax")]
        public string Lax { get; set; }
    }
}
