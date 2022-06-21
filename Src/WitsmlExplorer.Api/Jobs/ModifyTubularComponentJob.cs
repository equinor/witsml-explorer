using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularComponentJob
    {
        public TubularReference TubularReference { get; init; }
        public TubularComponent TubularComponent { get; init; }
    }
}
