using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data.MudLog
{
    [XmlRoot("mudLogs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlMudLogs : IWitsmlGrowingDataQueryType, IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("mudLog")]
        public List<WitsmlMudLog> MudLogs { get; set; } = new();

        public string TypeName => "mudLog";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => MudLogs;
            set => MudLogs = value.Select(obj => (WitsmlMudLog)obj).ToList();
        }
    }
}
