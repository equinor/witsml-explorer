using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyGeologyIntervalsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogDataJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTrajectoryStationsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyTubularComponentsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyWbGeometrySectionsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyWellJob : ICopyJob<WellReference, WellReference> { }
    public record CopyWellboreJob : ICopyJob<WellboreReference, WellboreReference> { }

    public abstract record CopyWithParentJob<T, U> : ICopyJob<T, U>
        where T : IReference
        where U : IReference
    {
        public CopyWellJob CopyWellJob { get; init; }

        public CopyWellboreJob CopyWellboreJob { get; init; }
    }

    public record CopyLogWithParentJob : CopyWithParentJob<ObjectReferences, WellboreReference>
    {
        public CopyLogJob CopyLogJob { get; init; }
    }

    public record CopyObjectsWithParentJob : CopyWithParentJob<ObjectReferences, WellboreReference>
    {
        public CopyObjectsJob CopyObjectsJob { get; init; }
    }
}
