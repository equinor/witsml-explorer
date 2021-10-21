using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyTrajectoryJob
    {
        public TrajectoryReference Source { get; init; }
        public WellboreReference Target { get; init; }
    }
}
