using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteRigJob
    {
        public RigReferences RigReferences { get; init; }
    }
}
