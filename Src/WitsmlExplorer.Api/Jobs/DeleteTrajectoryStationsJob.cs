using WitsmlExplorer.Api.Jobs.Common;
using System.Collections.Generic;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTrajectoryStationsJob
    {
        public TrajectoryReference Trajectory { get; init; }
        public IEnumerable<string> Uids { get; init; }
    }
}
