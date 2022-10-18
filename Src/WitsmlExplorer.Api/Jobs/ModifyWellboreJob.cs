using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyWellboreJob : Job
    {
        public Wellbore Wellbore { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Wellbore.WellUid}; WellboreUid: {Wellbore.Uid};";
        }

        public override string GetObjectName()
        {
            return null;
        }

        public override string GetWellboreName()
        {
            return Wellbore.Name;
        }

        public override string GetWellName()
        {
            return Wellbore.WellName;
        }
    }
}
