using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularComponentJob : IJob
    {
        public TubularReference TubularReference { get; init; }
        public TubularComponent TubularComponent { get; init; }

        public string Description()
        {
            return $"ToModify - {TubularReference.Description} TubularComponentUid: {TubularComponent.Uid};";
        }
    }
}
