using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record CopyTubularJob
    {
        public TubularReference Source { get; init; }
        public WellboreReference Target { get; init; }
    }
}
