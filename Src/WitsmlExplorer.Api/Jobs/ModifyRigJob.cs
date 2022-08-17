using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRigJob : IJob
    {
        public Rig Rig { get; init; }

        public string Description()
        {
            return $"ToModify - WellUid: {Rig.WellUid}; WellboreUid: {Rig.WellboreUid}; RigUid: {Rig.Uid};";
        }
    }
}
