using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("messages", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlMessages : IWitsmlObjectList
    {

        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("message")]
        public List<WitsmlMessage> Messages { get; set; } = new List<WitsmlMessage>();

        public string TypeName => "message";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Messages;
            set => Messages = value.Select(obj => (WitsmlMessage)obj).ToList();
        }
    }
}
