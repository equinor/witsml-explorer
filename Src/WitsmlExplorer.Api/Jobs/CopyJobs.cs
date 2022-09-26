using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyBhaRunJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyLogDataJob : ICopyJob<LogCurvesReference, ObjectReference> { }
    public record CopyLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyRigJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyRiskJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTrajectoryStationsJob : ICopyJob<TrajectoryStationReferences, ObjectReference> { }
    public record CopyTrajectoryJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTubularComponentsJob : ICopyJob<TubularComponentReferences, ObjectReference> { }
    public record CopyTubularJob : ICopyJob<ObjectReferences, WellboreReference> { }

}
