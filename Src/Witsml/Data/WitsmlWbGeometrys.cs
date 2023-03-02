using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("wbGeometrys", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlWbGeometrys : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("wbGeometry")]
        public List<WitsmlWbGeometry> WbGeometrys { get; set; } = new List<WitsmlWbGeometry>();

        public string TypeName => "wbGeometry";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => WbGeometrys;
            set => WbGeometrys = value.Select(obj => (WitsmlWbGeometry)obj).ToList();
        }
    }
}
