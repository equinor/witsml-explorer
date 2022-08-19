using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWellJob : Job
    {
        public Well Well { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Well.Uid};";
        }
    }
}
