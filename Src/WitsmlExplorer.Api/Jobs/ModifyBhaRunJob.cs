using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyBhaRunJob : IJob
    {
        public BhaRun BhaRun { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {BhaRun.WellUid}; WellboreUid: {BhaRun.WellboreUid}; BhaRunUid: {BhaRun.Uid};";
        }
    }
}
