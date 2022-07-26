using WitsmlExplorer.Api.Jobs.Common;

namespace WitsmlExplorer.Api.Jobs
{
    public record DeleteRiskJob
    {
        public RiskReferences RiskReferences { get; init; }
    }
}
