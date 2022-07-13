using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs.Common
{
    public class TrajectoryStationReference
    {
        public TrajectoryReference TrajectoryReference { get; set; }
        public IEnumerable<string> TrajectoryStationUids { get; set; } = new List<string>();
    }
}
