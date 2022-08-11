using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyLogDataJob : ICopyJob<LogCurvesReference, LogReference> { }
    public record CopyLogJob : ICopyJob<LogReferences, WellboreReference> { }
    public record CopyTrajectoryJob : ICopyJob<TrajectoryReference, WellboreReference> { }
    public record CopyTubularComponentsJob : ICopyJob<TubularComponentReferences, TubularReference> { }
    public record CopyTubularJob : ICopyJob<TubularReferences, WellboreReference> { }
    public record CopyBhaRunJob : ICopyJob<BhaRunReferences, WellboreReference> { }

}
