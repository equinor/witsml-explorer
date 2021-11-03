using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("mudLogs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlMudLogs : IWitsmlGrowingDataQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("mudLog")]
        public List<WitsmlMudLog> MudLogs { get; set; } = new();
        public string TypeName => "mudLog";
    }
}
