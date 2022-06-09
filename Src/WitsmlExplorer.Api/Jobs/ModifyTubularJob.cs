using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularJob
    {
        public Tubular Tubular { get; init; }
    }
}
