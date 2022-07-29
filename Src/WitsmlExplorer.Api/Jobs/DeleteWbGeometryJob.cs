using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteWbGeometryJob
    {
        public WbGeometryReferences WbGeometryReferences { get; init; }
    }
}
