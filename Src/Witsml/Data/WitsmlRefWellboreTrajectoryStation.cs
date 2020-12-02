using System.Xml.Serialization;
using Witsml.Data.Measures;

namespace Witsml.Data
{
    public class WitsmlRefWellboreTrajectoryStation
    {
        [XmlElement("stationReference")] public string StationReference { get; set; }
        [XmlElement("trajectoryParent")] public string TrajectoryParent { get; set; }
        [XmlElement("wellboreParent")] public string WellboreParent { get; set; }
    }
}
