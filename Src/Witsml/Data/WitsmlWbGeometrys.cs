using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("wbgeometrys", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlWbGeometrys : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("wbgeometry")]
        public List<WitsmlWbGeometry> WbGeometrys { get; set; } = new List<WitsmlWbGeometry>();

        public string TypeName => "wbgeometry";
    }
}
