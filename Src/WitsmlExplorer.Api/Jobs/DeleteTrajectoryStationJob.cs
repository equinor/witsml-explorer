using WitsmlExplorer.Api.Jobs.Common;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTrajectoryStationJob
    {
        public TrajectoryReference Trajectory { get; init; }
        public IEnumerable<string> Uids { get; init; }
    }
}
