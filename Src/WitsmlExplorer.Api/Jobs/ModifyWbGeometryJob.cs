using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWbGeometryJob : IJob
    {
        public WbGeometry WbGeometry { get; init; }

        public string Description()
        {
            return $"ToModify - WellUid: {WbGeometry.WellUid}; WellboreUid: {WbGeometry.WellboreUid}; WbGeometryUid: {WbGeometry.Uid};";
        }
    }
}
