using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateMudLogJob : IJob
    {
        public MudLog MudLog { get; init; }

        public override string Description()
        {
            return $"Create MudLog - WellUid: {MudLog.WellUid}; WellboreUid: {MudLog.WellboreUid}; MudLogUid: {MudLog.Uid};";
        }
    }
}
