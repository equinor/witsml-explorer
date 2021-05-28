using System.Collections.Generic;
using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlMudLogLithology
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("codeLith")]
        public string CodeLith { get; set; }

        [XmlElement("lithPc")]
        public WitsmlIndex LithPc { get; set; }
    }
}
