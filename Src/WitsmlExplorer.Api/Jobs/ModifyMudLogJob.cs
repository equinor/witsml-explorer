using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyMudLogJob : IJob
    {
        public MudLog MudLog { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {MudLog.WellUid}; WellboreUid: {MudLog.WellboreUid}; MudLogUid: {MudLog.Uid};";
        }
    }
}
