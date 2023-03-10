using WitsmlExplorer.Api.Jobs.Common;
using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyGeologyIntervalJob : Job
    {
        public ObjectReference MudLogReference { get; init; }
        public MudLogGeologyInterval GeologyInterval { get; init; }

        public override string Description()
        {
            return $"ToModify - {MudLogReference.Description()} GeologyIntervalUid: {GeologyInterval.Uid};";
        }

        public override string GetObjectName()
        {
            return MudLogReference.Name;
        }

        public override string GetWellboreName()
        {
            return MudLogReference.WellboreName;
        }

        public override string GetWellName()
        {
            return MudLogReference.WellName;
        }
    }
}
