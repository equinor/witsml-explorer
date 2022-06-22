using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteTubularJob
    {
        public TubularsReference TubularsReference { get; init; }
    }
}
