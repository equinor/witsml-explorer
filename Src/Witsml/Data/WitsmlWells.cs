using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("wells", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlWells : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("well")]
        public List<WitsmlWell> Wells { get; set; } = new List<WitsmlWell>();

        public string TypeName => "well";
    }
}
