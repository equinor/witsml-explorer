using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data.Rig
{
    [XmlRoot("rigs", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlRigs : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("rig")]
        public List<WitsmlRig> Rigs { get; set; } = new List<WitsmlRig>();

        public string TypeName => "rig";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Rigs;
            set => Rigs = value.Select(obj => (WitsmlRig)obj).ToList();
        }
    }
}
