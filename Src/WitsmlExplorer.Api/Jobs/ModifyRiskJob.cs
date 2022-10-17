using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRiskJob : Job
    {
        public Risk Risk { get; init; }

        public override string Description()
        {
            return $"ToModify - WellUid: {Risk.WellUid}; WellboreUid: {Risk.WellboreUid}; RiskUid: {Risk.Uid};";
        }

        public override string GetObjectName()
        {
            return Risk.Name;
        }

        public override string GetWellboreName()
        {
            return Risk.WellboreName;
        }

        public override string GetWellName()
        {
            return Risk.WellName;
        }
    }
}
