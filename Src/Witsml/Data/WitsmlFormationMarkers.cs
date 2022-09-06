using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("formationMarkers", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlFormationMarkers : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("formationMarker")]
        public List<WitsmlFormationMarker> FormationMarkers { get; set; } = new();

        public string TypeName => "formationMarker";
    }
}
