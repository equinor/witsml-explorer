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
    }
}
