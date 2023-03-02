using System.Collections.Generic;
using System.Linq;
using System.Xml.Serialization;

namespace Witsml.Data
{
    [XmlRoot("trajectorys", Namespace = "http://www.witsml.org/schemas/1series")]
    public class WitsmlTrajectories : IWitsmlGrowingDataQueryType, IWitsmlObjectList
    {
        [XmlAttribute("version")]
        public string Version = "1.4.1.1";

        [XmlElement("trajectory")]
        public List<WitsmlTrajectory> Trajectories { get; set; } = new();

        public string TypeName => "trajectory";

        [XmlIgnore]
        public IEnumerable<WitsmlObjectOnWellbore> Objects
        {
            get => Trajectories;
            set => Trajectories = value.Select(obj => (WitsmlTrajectory)obj).ToList();
        }
    }
}
