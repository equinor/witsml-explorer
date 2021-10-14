using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteRiskJob
    {
        public RiskReference RiskReference { get; init; }
    }
}
