using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyFormationMarkerJob : Job
    {
        public FormationMarker FormationMarker { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {FormationMarker.WellUid}; WellboreUid: {FormationMarker.WellboreUid}; FormationMarkerUid: {FormationMarker.Uid};";
        }

        public override string GetObjectName()
        {
            return FormationMarker.Name;
        }

        public override string GetWellboreName()
        {
            return FormationMarker.WellboreName;
        }

        public override string GetWellName()
        {
            return FormationMarker.WellName;
        }
    }
}
