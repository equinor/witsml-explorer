using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("tubulars", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlTubulars : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("tubular")]
        public List<WitsmlTubular> Tubulars { get; set; } = new List<WitsmlTubular>();
        public string TypeName => "tubular";
    }
}
