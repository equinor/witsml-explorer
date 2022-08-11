using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRigJob
    {
        public Rig Rig { get; init; }
    }
}
