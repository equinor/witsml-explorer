using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyLogDataJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTrajectoryStationsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyTubularComponentsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyWbGeometrySectionsJob : ICopyJob<ComponentReferences, ObjectReference> { }
}
