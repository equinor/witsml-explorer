using System.Collections.Generic;

using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTrajectoryStationsJob
    {
        public TrajectoryReference Trajectory { get; init; }
        public IEnumerable<string> Uids { get; init; }
    }
}
