using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("messages", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlMessageObjects : IWitsmlQueryType
    {

        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("message")]
        public List<WitsmlMessageObject> MessageObjects { get; set; } = new List<WitsmlMessageObject>();

        public string TypeName => "message";
    }
}
