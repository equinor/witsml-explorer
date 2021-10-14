using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTrajectoryJob
    {
        public TrajectoryReference TrajectoryReference { get; init; }
    }
}
