using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateWbGeometryJob
    {
        public WbGeometry WbGeometry { get; init; }
    }
}
