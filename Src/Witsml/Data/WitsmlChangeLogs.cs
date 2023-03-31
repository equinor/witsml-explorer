using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("changeLogs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlChangeLogs : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("changeLog")]
        public List<WitsmlChangeLog> ChangeLogs { get; set; } = new List<WitsmlChangeLog>();

        public string TypeName => "changeLog";
    }
}
