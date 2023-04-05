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

    public abstract record CopyWithParentJob : ICopyJob<ObjectReferences, WellboreReference>
    {
        public CopyWellJob CopyWellJob { get; init; }

        public CopyWellboreJob CopyWellboreJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - Source - {Source.Description()}\t\nTarget - {Target.Description()}";
        }
    }

    public record CopyLogWithParentJob : CopyWithParentJob { }

    public record CopyObjectsWithParentJob : CopyWithParentJob { }
}
