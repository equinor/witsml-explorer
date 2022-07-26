using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWbGeometryJob
    {
        public WbGeometry WbGeometry { get; init; }
    }
}
