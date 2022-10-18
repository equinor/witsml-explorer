using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyBhaRunJob : Job
    {
        public BhaRun BhaRun { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {BhaRun.WellUid}; WellboreUid: {BhaRun.WellboreUid}; BhaRunUid: {BhaRun.Uid};";
        }

        public override string GetObjectName()
        {
            return BhaRun.Name;
        }

        public override string GetWellboreName()
        {
            return BhaRun.WellboreName;
        }

        public override string GetWellName()
        {
            return BhaRun.WellName;
        }
    }
}
