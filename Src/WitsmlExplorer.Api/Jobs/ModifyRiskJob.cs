using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record ModifyRiskJob
    {
        public Risk Risk { get; init; }
    }
}
