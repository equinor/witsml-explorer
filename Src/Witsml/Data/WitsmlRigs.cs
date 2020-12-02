using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("rigs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlRigs : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("rig")]
        public List<WitsmlRig> Rigs { get; set; } = new List<WitsmlRig>();

        public string TypeName => "rig";
    }
}
