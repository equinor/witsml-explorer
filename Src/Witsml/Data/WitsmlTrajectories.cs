using System.Collections.Generic;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("trajectorys", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlTrajectories : IWitsmlQueryType
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("trajectory")]
        public List<WitsmlTrajectory> Trajectories { get; set; } = new List<WitsmlTrajectory>();

        public string TypeName => "trajectory";
    }
}
