using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyComponentsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference> { }

    public record CopyLogDataJob : ICopyJob<ComponentReferences, ObjectReference>
    {
        public string StartIndex { get; init; }
        public string EndIndex { get; init; }

        public override string Description()
        {
            string startIndexDesc = string.IsNullOrEmpty(StartIndex) ? "" : $"\t\nStartIndex: {StartIndex};";
            string endIndexDesc = string.IsNullOrEmpty(EndIndex) ? "" : $"\t\nEndIndex: {EndIndex};";
            return $"{base.Description()}{startIndexDesc}{endIndexDesc}";
        }
    }

    public record CopyWellJob : ICopyJob<WellReference, WellReference> { }
    public record CopyWellboreJob : ICopyJob<WellboreReference, WellboreReference> { }

    public record CopyWithParentJob : ICopyJob<ObjectReferences, WellboreReference>
    {
        public CopyWellJob CopyWellJob { get; init; }

        public CopyWellboreJob CopyWellboreJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - Source - {Source.Description()}\t\nTarget - {Target.Description()}";
        }
    }
}
