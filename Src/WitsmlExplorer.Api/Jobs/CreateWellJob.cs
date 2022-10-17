using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWellJob : Job
    {
        public Well Well { get; init; }

        public override string Description()
        {
            return $"Create Well - WellUid: {Well.Uid};";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return null;
        }

        public override string GetWellName()
        {
            return Well.Name;
        }
    }
}
