using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTrajectoryStationJob
    {
        public TrajectoryReference TrajectoryReference { get; init; }
        public TrajectoryStation TrajectoryStation { get; init; }
    }
}
