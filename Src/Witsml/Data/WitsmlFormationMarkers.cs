using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("formationMarkers", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlFormationMarkers : IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("formationMarker")]
        public List<WitsmlFormationMarker> FormationMarkers { get; set; } = new();

        public string TypeName => "formationMarker";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => FormationMarkers;
            set => FormationMarkers = value.Select(obj => (WitsmlFormationMarker)obj).ToList();
        }
    }
}
