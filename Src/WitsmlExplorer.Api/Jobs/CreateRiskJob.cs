using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Jobs
{
    public record CreateRiskJob
    {
        public Risk Risk { get; init; }
    }
}
