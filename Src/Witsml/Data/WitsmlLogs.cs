using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("logs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlLogs : IWitsmlGrowingDataQueryType, IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("log")]
        public List<WitsmlLog> Logs { get; set; } = new();

        public string TypeName => "log";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Logs;
            set => Logs = value.Select(obj => (WitsmlLog)obj).ToList();
        }
    }
}
