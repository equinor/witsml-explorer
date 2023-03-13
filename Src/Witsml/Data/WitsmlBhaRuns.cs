using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("bhaRuns", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlBhaRuns : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("bhaRun")]
        public List<WitsmlBhaRun> BhaRuns { get; set; } = new List<WitsmlBhaRun>();

        public string TypeName => "bhaRun";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => BhaRuns;
            set => BhaRuns = value.Select(obj => (WitsmlBhaRun)obj).ToList();
        }
    }
}
