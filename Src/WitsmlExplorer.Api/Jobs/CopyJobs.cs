using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyGeologyIntervalsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyLogJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyObjectsJob : ICopyJob<ObjectReferences, WellboreReference> { }
    public record CopyTrajectoryStationsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyTubularComponentsJob : ICopyJob<ComponentReferences, ObjectReference> { }
    public record CopyWbGeometrySectionsJob : ICopyJob<ComponentReferences, ObjectReference> { }

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
}
