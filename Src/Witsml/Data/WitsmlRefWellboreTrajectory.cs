using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRefWellboreTrajectory
    {
        [XmlElement("trajectoryReference")]
        public WitsmlObjectReference TrajectoryReference { get; set; }

        [XmlElement("wellboreParent")]
        public WitsmlObjectReference WellboreParent { get; set; }
    }
}
