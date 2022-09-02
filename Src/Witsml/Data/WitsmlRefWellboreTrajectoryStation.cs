using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRefWellboreTrajectoryStation
    {
        [XmlElement("stationReference")] public string StationReference { get; set; }
        [XmlElement("trajectoryParent")] public WitsmlObjectReference TrajectoryParent { get; set; }
        [XmlElement("wellboreParent")] public WitsmlObjectReference WellboreParent { get; set; }
    }
}
