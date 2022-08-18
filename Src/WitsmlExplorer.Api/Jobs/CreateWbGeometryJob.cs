using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWbGeometryJob : IJob
    {
        public WbGeometry WbGeometry { get; init; }

        public override string Description()
        {
            return $"Create WbGeometry - WellUid: {WbGeometry.WellUid}; WellboreUid: {WbGeometry.WellboreUid}; WbGeometryUid: {WbGeometry.Uid};";
        }
    }
}
