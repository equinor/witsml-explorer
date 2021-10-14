using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyLogJob
    {
        public LogReferences Source { get; init; }
        public WellboreReference Target { get; init; }
    }
}
