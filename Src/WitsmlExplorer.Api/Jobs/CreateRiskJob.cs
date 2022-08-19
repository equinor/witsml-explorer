using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateRiskJob : Job
    {
        public Risk Risk { get; init; }

        public override string Description()
        {
            return $"Create Risk - WellUid: {Risk.WellUid}; WellboreUid: {Risk.WellboreUid}; RiskUid: {Risk.Uid};";
        }
    }
}
