using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyTrajectoryJob : ICopyJob<TrajectoryReference, WellboreReference>
    {
    }
}
