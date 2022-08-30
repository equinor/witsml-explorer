using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyBhaRunJob : ICopyJob<BhaRunReferences, WellboreReference> { }
    public record CopyLogDataJob : ICopyJob<LogCurvesReference, LogReference> { }
    public record CopyLogJob : ICopyJob<LogReferences, WellboreReference> { }
    public record CopyRiskJob : ICopyJob<RiskReferences, WellboreReference> { }
    public record CopyTrajectoryJob : ICopyJob<TrajectoryReference, WellboreReference> { }
    public record CopyTubularComponentsJob : ICopyJob<TubularComponentReferences, TubularReference> { }
    public record CopyTubularJob : ICopyJob<TubularReferences, WellboreReference> { }

}
