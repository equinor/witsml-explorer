using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWbGeometryJob : Job
    {
        public WbGeometry WbGeometry { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {WbGeometry.WellUid}; WellboreUid: {WbGeometry.WellboreUid}; WbGeometryUid: {WbGeometry.Uid};";
        }
    }
}
