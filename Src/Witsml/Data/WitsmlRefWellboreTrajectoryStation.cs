using System.Xml.Serialization;

namespace Witsml.Data
{
    public class WitsmlRefWellboreTrajectoryStation
    {
        [XmlElement("stationReference")] public string StationReference { get; set; }
        [XmlElement("trajectoryParent")] public WitsmlRefNameString TrajectoryParent { get; set; }
        [XmlElement("wellboreParent")] public WitsmlRefNameString WellboreParent { get; set; }
    }
}
