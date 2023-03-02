using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data.Tubular
{
    [XmlRoot("tubulars", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlTubulars : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("tubular")]
        public List<WitsmlTubular> Tubulars { get; set; } = new List<WitsmlTubular>();

        public string TypeName => "tubular";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Tubulars;
            set => Tubulars = value.Select(obj => (WitsmlTubular)obj).ToList();
        }
    }
}
