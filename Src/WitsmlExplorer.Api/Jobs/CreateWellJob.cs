using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWellJob : IJob
    {
        public Well Well { get; init; }

        public override string Description()
        {
            return $"Create Well - WellUid: {Well.Uid};";
        }
    }
}
