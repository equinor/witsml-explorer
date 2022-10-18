using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyMessageObjectJob : Job
    {
        public MessageObject MessageObject { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {MessageObject.WellUid}; WellboreUid: {MessageObject.WellboreUid}; MessageUid: {MessageObject.Uid};";
        }

        public override string GetObjectName()
        {
            return MessageObject.Name;
        }

        public override string GetWellboreName()
        {
            return MessageObject.WellboreName;
        }

        public override string GetWellName()
        {
            return MessageObject.WellName;
        }
    }
}
