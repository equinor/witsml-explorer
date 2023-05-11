using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("fluidsReports", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlFluidsReports : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("fluidsReport")]
        public List<WitsmlFluidsReport> FluidsReports { get; set; } = new();

        public string TypeName => "fluidsReport";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => FluidsReports;
            set => FluidsReports = value.Select(obj => (WitsmlFluidsReport)obj).ToList();
        }
    }
}
