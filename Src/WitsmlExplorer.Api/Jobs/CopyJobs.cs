using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyBhaRunJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyGeologyIntervalsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogDataJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyMudLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyRigJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyRiskJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTrajectoryStationsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyTrajectoryJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTubularComponentsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyTubularJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyWbGeometrySectionsJob : ICopyJob<ComponentReferences, ObjectReference> { }

}
