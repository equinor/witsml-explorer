using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRigJob : Job
    {
        public Rig Rig { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Rig.WellUid}; WellboreUid: {Rig.WellboreUid}; RigUid: {Rig.Uid};";
        }

        public override string GetObjectName()
        {
            return Rig.Name;
        }

        public override string GetWellboreName()
        {
            return Rig.WellboreName;
        }

        public override string GetWellName()
        {
            return Rig.WellName;
        }
    }
}
