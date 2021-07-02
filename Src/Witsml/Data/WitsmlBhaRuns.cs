using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("bhaRuns", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlBhaRuns : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("bhaRun")]
        public List<WitsmlBhaRun> BhaRuns { get; set; } = new List<WitsmlBhaRun>();

        public string TypeName => "bhaRun";
    }
}
