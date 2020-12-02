using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("wellbores", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlWellbores : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("wellbore")]
        public List<WitsmlWellbore> Wellbores { get; set; } = new List<WitsmlWellbore>();
        public string TypeName => "wellbore";
    }
}
