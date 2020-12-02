using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlWellboreTrajectory
    {
        [XmlAttribute("trajectoryReference")]
        public string TrajectoryReference { get; set; }

        [XmlAttribute("wellboreParent")]
        public string WellboreParent { get; set; }
    }
}
