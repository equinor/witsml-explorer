using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRefWellboreTrajectory
    {
        [XmlElement("trajectoryReference")]
        public WitsmlRefNameString TrajectoryReference { get; set; }

        [XmlElement("wellboreParent")]
        public WitsmlRefNameString WellboreParent { get; set; }
    }
}
