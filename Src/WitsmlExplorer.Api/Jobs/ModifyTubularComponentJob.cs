using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyTubularComponentJob : Job
    {
        public ObjectReference TubularReference { get; init; }
        public TubularComponent TubularComponent { get; init; }

        public override string Description()
        {
            return $"ToModify - {TubularReference.Description()} TubularComponentUid: {TubularComponent.Uid};";
        }

        public override string GetObjectName()
        {
            return TubularReference.Name;
        }

        public override string GetWellboreName()
        {
            return TubularReference.WellboreName;
        }

        public override string GetWellName()
        {
            return TubularReference.WellName;
        }
    }
}
